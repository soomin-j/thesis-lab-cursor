export interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

export interface RoutePoint {
  latitude: number
  longitude: number
  timestamp: Date
}

export class GPSTracker {
  private watchId: number | null = null
  private positions: RoutePoint[] = []
  private isTracking: boolean = false
  private onPositionUpdate?: (position: GPSPosition) => void
  private onError?: (error: GeolocationPositionError) => void

  constructor(
    onPositionUpdate?: (position: GPSPosition) => void,
    onError?: (error: GeolocationPositionError) => void
  ) {
    this.onPositionUpdate = onPositionUpdate
    this.onError = onError
  }

  async startTracking(options?: PositionOptions): Promise<void> {
    if (this.isTracking) {
      return
    }

    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser")
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    }

    this.isTracking = true
    this.positions = []

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        }

        this.positions.push({
          latitude: gpsPosition.latitude,
          longitude: gpsPosition.longitude,
          timestamp: new Date(gpsPosition.timestamp),
        })

        if (this.onPositionUpdate) {
          this.onPositionUpdate(gpsPosition)
        }
      },
      (error) => {
        if (this.onError) {
          this.onError(error)
        }
      },
      defaultOptions
    )
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.isTracking = false
  }

  pauseTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    // Keep isTracking true so we can resume
  }

  resumeTracking(options?: PositionOptions): void {
    if (this.isTracking && this.watchId === null) {
      this.startTracking(options)
    }
  }

  getRoute(): RoutePoint[] {
    return [...this.positions]
  }

  clearRoute(): void {
    this.positions = []
  }

  getDistance(): number {
    if (this.positions.length < 2) {
      return 0
    }

    let totalDistance = 0
    for (let i = 1; i < this.positions.length; i++) {
      totalDistance += this.calculateDistance(
        this.positions[i - 1],
        this.positions[i]
      )
    }

    return totalDistance
  }

  private calculateDistance(
    point1: RoutePoint,
    point2: RoutePoint
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180
    const φ2 = (point2.latitude * Math.PI) / 180
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  isActive(): boolean {
    return this.isTracking
  }
}

// Helper function to convert route points to GeoJSON LineString
export function routeToGeoJSON(route: RoutePoint[]): string {
  const coordinates = route.map((point) => [point.longitude, point.latitude])
  return JSON.stringify({
    type: "LineString",
    coordinates,
  })
}




