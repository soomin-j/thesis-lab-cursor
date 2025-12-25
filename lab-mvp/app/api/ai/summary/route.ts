import { NextRequest, NextResponse } from "next/server"
import {
  aggregateLocationTags,
  generateLocationSummary,
} from "@/lib/ai"

export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams
    const latitude = parseFloat(searchParams.get("latitude") || "0")
    const longitude = parseFloat(searchParams.get("longitude") || "0")
    const radius = parseFloat(searchParams.get("radius") || "50")

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "latitude and longitude are required" },
        { status: 400 }
      )
    }

    // Aggregate tags for this location
    const tagAggregate = await aggregateLocationTags(
      latitude,
      longitude,
      radius
    )

    if (Object.keys(tagAggregate).length === 0) {
      return NextResponse.json({
        summary: "No user tags available for this location yet.",
        tagAggregate: {},
      })
    }

    // Generate location key (rounded coordinates)
    const roundedLat = Math.round(latitude * 1000) / 1000
    const roundedLng = Math.round(longitude * 1000) / 1000
    const locationKey = `${roundedLat},${roundedLng}`

    // Generate or get cached summary
    const summary = await generateLocationSummary(locationKey, tagAggregate)

    return NextResponse.json({
      summary,
      tagAggregate,
      locationKey,
    })
  } catch (error) {
    console.error("Error generating location summary:", error)
    return NextResponse.json(
      { error: "Failed to generate location summary" },
      { status: 500 }
    )
  }
}

