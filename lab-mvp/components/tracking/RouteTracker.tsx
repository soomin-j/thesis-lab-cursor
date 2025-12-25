"use client"

import { useEffect, useState, useRef } from "react"
import { GPSTracker, RoutePoint, GPSPosition } from "@/lib/gps"

interface RouteTrackerProps {
  onRouteUpdate?: (route: RoutePoint[]) => void
  onPositionUpdate?: (position: GPSPosition) => void
  onDistanceUpdate?: (distance: number) => void
  onError?: (error: GeolocationPositionError) => void
}

export function useRouteTracker({
  onRouteUpdate,
  onPositionUpdate,
  onDistanceUpdate,
  onError,
}: RouteTrackerProps = {}) {
  const [isTracking, setIsTracking] = useState(false)
  const [distance, setDistance] = useState(0)
  const trackerRef = useRef<GPSTracker | null>(null)

  useEffect(() => {
    trackerRef.current = new GPSTracker(
      (position) => {
        if (onPositionUpdate) {
          onPositionUpdate(position)
        }
        const route = trackerRef.current?.getRoute() || []
        if (onRouteUpdate) {
          onRouteUpdate(route)
        }
        const newDistance = trackerRef.current?.getDistance() || 0
        setDistance(newDistance)
        if (onDistanceUpdate) {
          onDistanceUpdate(newDistance)
        }
      },
      (error) => {
        if (onError) {
          onError(error)
        }
      }
    )

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking()
      }
    }
  }, [onRouteUpdate, onPositionUpdate, onDistanceUpdate, onError])

  const startTracking = async () => {
    if (trackerRef.current && !isTracking) {
      try {
        await trackerRef.current.startTracking({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
        setIsTracking(true)
      } catch (error) {
        console.error("Failed to start tracking:", error)
        throw error
      }
    }
  }

  const stopTracking = () => {
    if (trackerRef.current && isTracking) {
      trackerRef.current.stopTracking()
      setIsTracking(false)
    }
  }

  const pauseTracking = () => {
    if (trackerRef.current && isTracking) {
      trackerRef.current.pauseTracking()
      setIsTracking(false)
    }
  }

  const resumeTracking = async () => {
    if (trackerRef.current && !isTracking) {
      try {
        await trackerRef.current.resumeTracking({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
        setIsTracking(true)
      } catch (error) {
        console.error("Failed to resume tracking:", error)
        throw error
      }
    }
  }

  const clearRoute = () => {
    if (trackerRef.current) {
      trackerRef.current.clearRoute()
      setDistance(0)
      if (onRouteUpdate) {
        onRouteUpdate([])
      }
    }
  }

  return {
    isTracking,
    distance,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    clearRoute,
    getRoute: () => trackerRef.current?.getRoute() || [],
  }
}




