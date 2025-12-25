"use client"

import { useState, useCallback, useEffect } from "react"
import MapView from "@/components/map/DynamicMapView"
import { useRouteTracker } from "@/components/tracking/RouteTracker"
import { TagSelector } from "@/components/tags/TagSelector"
import { LocationPreview } from "@/components/tags/LocationPreview"
import { routeToGeoJSON } from "@/lib/gps"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function WalkPage() {
  const router = useRouter()
  const [route, setRoute] = useState<any[]>([])
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [distance, setDistance] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [taggingLocation, setTaggingLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [routeId, setRouteId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const {
    isTracking,
    startTracking,
    stopTracking,
    clearRoute,
  } = useRouteTracker({
    onRouteUpdate: (newRoute) => {
      setRoute(newRoute)
    },
    onPositionUpdate: (position) => {
      setCurrentPosition({
        lat: position.latitude,
        lng: position.longitude,
      })
    },
    onDistanceUpdate: (newDistance) => {
      setDistance(newDistance)
    },
    onError: (error) => {
      console.error("GPS Error:", error)
      alert("GPS error: " + error.message)
    },
  })

  const handleStartWalk = async () => {
    try {
      await startTracking()
      setStartTime(new Date())
      // Create a new route
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date().toISOString(),
          polyline: "",
          distance: 0,
        }),
      })
      const newRoute = await response.json()
      setRouteId(newRoute.id)
    } catch (error) {
      console.error("Failed to start tracking:", error)
      alert("Failed to start GPS tracking. Please check permissions.")
    }
  }

  const handleStopWalk = async () => {
    stopTracking()
    if (routeId && route.length > 0) {
      const geoJSON = routeToGeoJSON(route)
      await fetch(`/api/routes/${routeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          polyline: geoJSON,
          distance,
        }),
      })
    }
    router.push("/dashboard")
  }

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setTaggingLocation({ lat, lng })
    setShowTagSelector(true)
    setSelectedTags([])
  }, [])

  const handleSaveTags = async () => {
    if (!taggingLocation || selectedTags.length === 0) {
      setShowTagSelector(false)
      return
    }

    try {
      // Create location
      const locationResponse = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: taggingLocation.lat,
          longitude: taggingLocation.lng,
          routeId: routeId || null,
          timestamp: new Date().toISOString(),
        }),
      })

      const location = await locationResponse.json()

      // Add tags to location
      for (const tagId of selectedTags) {
        await fetch(`/api/locations/${location.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId }),
        })
      }

      setShowTagSelector(false)
      setTaggingLocation(null)
      setSelectedTags([])
    } catch (error) {
      console.error("Error saving tags:", error)
      alert("Failed to save tags")
    }
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(2)}km`
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const [elapsedTime, setElapsedTime] = useState(0)

  // Update elapsed time
  useEffect(() => {
    if (isTracking && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - startTime.getTime()) / 1000)
        )
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isTracking, startTime])

  return (
    <div className="flex h-screen flex-col">
        <div className="relative flex-1 overflow-hidden">
          <MapView
            route={route}
            currentPosition={currentPosition || undefined}
            onMapClick={!showTagSelector ? handleMapClick : undefined}
            height="100%"
          />

          {!isTracking && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
              <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
                <h2 className="mb-4 text-2xl font-bold">Ready to walk?</h2>
                <button
                  onClick={handleStartWalk}
                  className="rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
                >
                  Start Tracking
                </button>
              </div>
            </div>
          )}

          {isTracking && (
            <div className="absolute top-4 left-4 right-4 z-10 rounded-xl bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDistance(distance)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(elapsedTime)}
                  </div>
                </div>
                <button
                  onClick={handleStopWalk}
                  className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
                >
                  Stop
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Tap the map to tag locations
              </div>
            </div>
          )}

          {showTagSelector && (
            <div className="absolute bottom-0 left-0 right-0 z-20 max-h-[60vh] rounded-t-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="font-semibold">Tag this location</h3>
                <button
                  onClick={() => {
                    setShowTagSelector(false)
                    setTaggingLocation(null)
                    setSelectedTags([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
              <div className="border-t border-gray-200 bg-white p-4">
                <button
                  onClick={handleSaveTags}
                  disabled={selectedTags.length === 0}
                  className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
                >
                  Save Tags
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}

