import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Pre-defined tags
const DEFAULT_TAGS = [
  { name: "calm", category: "mood", icon: "😌", color: "#8B5CF6" },
  { name: "noisy", category: "sensory", icon: "🔊", color: "#EF4444" },
  { name: "quiet", category: "sensory", icon: "🔇", color: "#10B981" },
  { name: "bright", category: "sensory", icon: "☀️", color: "#F59E0B" },
  { name: "dim", category: "sensory", icon: "🌙", color: "#6366F1" },
  { name: "crowded", category: "environment", icon: "👥", color: "#EC4899" },
  { name: "spacious", category: "environment", icon: "🏞️", color: "#14B8A6" },
  { name: "nature", category: "environment", icon: "🌳", color: "#22C55E" },
  { name: "urban", category: "environment", icon: "🏙️", color: "#6B7280" },
  { name: "peaceful", category: "mood", icon: "🕊️", color: "#06B6D4" },
  { name: "energetic", category: "mood", icon: "⚡", color: "#F97316" },
  { name: "serene", category: "mood", icon: "🌊", color: "#3B82F6" },
]

export async function GET() {
  try {
    // Initialize default tags if they don't exist
    for (const tag of DEFAULT_TAGS) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag,
      })
    }

    const tags = await prisma.tag.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    )
  }
}




