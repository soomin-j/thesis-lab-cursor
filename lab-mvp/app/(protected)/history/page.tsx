"use client"

import { useState, useEffect } from "react"
import MapView from "@/components/map/DynamicMapView"
import { LocationPreview } from "@/components/tags/LocationPreview"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface Route {
  id: string
  startTime: string
  endTime: string | null
  distance: number | null
  polyline: string
  locations: Array<{
    id: string
    latitude: number
    longitude: number
    timestamp: string
    tags: Array<{
      tag: {
        id: string
        name: string
        icon: string | null
        color: string | null
      }
    }>
  }>
}

export default function HistoryPage() {
  const searchParams = useSearchParams()
  const routeId = searchParams.get("route")
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [dateFilter, setDateFilter] = useState<{
    start: string
    end: string
  } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (dateFilter?.start) {
      params.append("startDate", dateFilter.start)
    }
    if (dateFilter?.end) {
      params.append("endDate", dateFilter.end)
    }

    fetch(`/api/routes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setRoutes(data)
        if (routeId) {
          const route = data.find((r: Route) => r.id === routeId)
          if (route) {
            setSelectedRoute(route)
          }
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching routes:", error)
        setLoading(false)
      })
  }, [routeId, dateFilter])

  // Get all tagged locations from selected route or all routes
  const taggedLocations =
    selectedRoute?.locations.filter((loc) => loc.tags.length > 0) ||
    routes.flatMap((r) => r.locations.filter((loc) => loc.tags.length > 0)) ||
    []

  // Parse route polyline to route points
  const getRoutePoints = (route: Route | null) => {
    if (!route?.polyline) return []
    try {
      const geoJSON = JSON.parse(route.polyline)
      return (
        geoJSON.coordinates?.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
          timestamp: new Date(),
        })) || []
      )
    } catch {
      return []
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatDistance = (meters: number | null) => {
    if (!meters) return "0 km"
    return `${(meters / 1000).toFixed(2)} km`
  }

  return (
    <div className="flex h-screen flex-col">
        <header className="bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Route History</h1>
            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Back
            </Link>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 overflow-y-auto border-r border-gray-200 bg-white">
            <div className="p-4">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateFilter?.start || ""}
                  onChange={(e) =>
                    setDateFilter({
                      start: e.target.value,
                      end: dateFilter?.end || "",
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateFilter?.end || ""}
                  onChange={(e) =>
                    setDateFilter({
                      start: dateFilter?.start || "",
                      end: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter(null)}
                  className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="border-t border-gray-200">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading routes...
                </div>
              ) : routes.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No routes found
                </div>
              ) : (
                routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full border-b border-gray-200 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                      selectedRoute?.id === route.id ? "bg-purple-50" : ""
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {formatDate(route.startTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistance(route.distance)}
                    </div>
                    {route.locations.filter((l) => l.tags.length > 0).length >
                      0 && (
                      <div className="mt-1 text-xs text-purple-600">
                        {
                          route.locations.filter((l) => l.tags.length > 0)
                            .length
                        }{" "}
                        tagged locations
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="relative flex-1">
            <MapView
              route={getRoutePoints(selectedRoute)}
              taggedLocations={taggedLocations}
              onMapClick={(lat, lng) => setSelectedLocation({ lat, lng })}
              height="100%"
            />
          </div>
        </div>
      </div>

      {selectedLocation && (
        <LocationPreview
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
          onClose={() => setSelectedLocation(null)}
        />
      )}
  )
}

