import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/api-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)

    const route = await prisma.route.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        locations: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    })

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error("Error fetching route:", error)
    return NextResponse.json(
      { error: "Failed to fetch route" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    const body = await request.json()
    const { endTime, polyline, distance } = body

    const route = await prisma.route.updateMany({
      where: {
        id: params.id,
        userId,
      },
      data: {
        ...(endTime && { endTime: new Date(endTime) }),
        ...(polyline && { polyline }),
        ...(distance !== undefined && { distance }),
      },
    })

    if (route.count === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    const updatedRoute = await prisma.route.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json(updatedRoute)
  } catch (error) {
    console.error("Error updating route:", error)
    return NextResponse.json(
      { error: "Failed to update route" },
      { status: 500 }
    )
  }
}

