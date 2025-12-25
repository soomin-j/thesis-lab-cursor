import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/api-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    const body = await request.json()
    const { tagId } = body

    // Verify location exists and belongs to user
    const location = await prisma.location.findFirst({
      where: {
        id: params.locationId,
        userId,
      },
    })

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      )
    }

    // Add tag to location
    const locationTag = await prisma.locationTag.upsert({
      where: {
        locationId_tagId_userId: {
          locationId: params.locationId,
          tagId,
          userId,
        },
      },
      update: {},
      create: {
        locationId: params.locationId,
        tagId,
        userId,
      },
      include: {
        tag: true,
      },
    })

    return NextResponse.json(locationTag, { status: 201 })
  } catch (error) {
    console.error("Error adding tag to location:", error)
    return NextResponse.json(
      { error: "Failed to add tag to location" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    const searchParams = request.nextUrl.searchParams
    const tagId = searchParams.get("tagId")

    if (!tagId) {
      return NextResponse.json(
        { error: "tagId is required" },
        { status: 400 }
      )
    }

    await prisma.locationTag.deleteMany({
      where: {
        locationId: params.locationId,
        tagId,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing tag from location:", error)
    return NextResponse.json(
      { error: "Failed to remove tag from location" },
      { status: 500 }
    )
  }
}

