import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      userId,
    }

    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) {
        where.startTime.gte = new Date(startDate)
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate)
      }
    }

    const routes = await prisma.route.findMany({
      where,
      include: {
        locations: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error("Error fetching routes:", error)
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    const body = await request.json()
    const { startTime, endTime, polyline, distance, locations } = body

    const route = await prisma.route.create({
      data: {
        userId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        polyline: polyline || "",
        distance: distance || null,
        locations: locations
          ? {
              create: locations.map((loc: any) => ({
                userId,
                latitude: loc.latitude,
                longitude: loc.longitude,
                timestamp: new Date(loc.timestamp),
              })),
            }
          : undefined,
      },
      include: {
        locations: true,
      },
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error("Error creating route:", error)
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    )
  }
}

