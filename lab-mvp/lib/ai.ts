import OpenAI from "openai"
import { prisma } from "./db"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TagAggregate {
  [tagName: string]: number
}

export async function generateLocationSummary(
  locationKey: string,
  tagAggregate: TagAggregate
): Promise<string> {
  // Check cache first
  const cached = await prisma.locationSummary.findUnique({
    where: { locationKey },
  })

  // Return cached summary if it's less than 24 hours old
  if (cached?.summary && cached.lastUpdated) {
    const hoursSinceUpdate =
      (Date.now() - cached.lastUpdated.getTime()) / (1000 * 60 * 60)
    if (hoursSinceUpdate < 24) {
      return cached.summary
    }
  }

  // Generate summary from tags
  const tagDescriptions = Object.entries(tagAggregate)
    .map(([tag, count]) => `${tag} (${count} users)`)
    .join(", ")

  const prompt = `Based on the following user tags for this location, generate a brief, helpful summary (2-3 sentences) describing how this place might feel to visit. Focus on sensory and mood aspects.

Tags: ${tagDescriptions}

Summary:`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that describes places based on user-reported sensory and mood tags. Be concise, accurate, and focus on what someone visiting this place might experience.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const summary =
      completion.choices[0]?.message?.content?.trim() ||
      "No summary available for this location."

    // Cache the summary
    await prisma.locationSummary.upsert({
      where: { locationKey },
      update: {
        summary,
        tagAggregate: tagAggregate as any,
        lastUpdated: new Date(),
      },
      create: {
        locationKey,
        summary,
        tagAggregate: tagAggregate as any,
        lastUpdated: new Date(),
      },
    })

    return summary
  } catch (error) {
    console.error("Error generating location summary:", error)
    return "Unable to generate summary at this time."
  }
}

export async function aggregateLocationTags(
  latitude: number,
  longitude: number,
  radiusMeters: number = 50
): Promise<TagAggregate> {
  // Round to ~100m precision for location key
  const roundedLat = Math.round(latitude * 1000) / 1000
  const roundedLng = Math.round(longitude * 1000) / 1000

  // Find all locations within radius
  // Note: This is a simplified approach. For production, use PostGIS for proper geospatial queries
  const locations = await prisma.location.findMany({
    where: {
      latitude: {
        gte: roundedLat - radiusMeters / 111000, // rough conversion
        lte: roundedLat + radiusMeters / 111000,
      },
      longitude: {
        gte: roundedLng - radiusMeters / 111000,
        lte: roundedLng + radiusMeters / 111000,
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  const tagCounts: TagAggregate = {}

  locations.forEach((location) => {
    location.tags.forEach((locationTag) => {
      const tagName = locationTag.tag.name
      tagCounts[tagName] = (tagCounts[tagName] || 0) + 1
    })
  })

  return tagCounts
}




