"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import { MapClickHandler } from "./MapClickHandler"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

interface RoutePoint {
  latitude: number
  longitude: number
  timestamp: Date
}

interface TaggedLocation {
  id: string
  latitude: number
  longitude: number
  tags: Array<{
    tag: {
      id: string
      name: string
      icon: string | null
      color: string | null
    }
  }>
}

interface MapViewProps {
  route?: RoutePoint[]
  currentPosition?: { lat: number; lng: number }
  taggedLocations?: TaggedLocation[]
  onMapClick?: (lat: number, lng: number) => void
  height?: string
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

export default function MapView({
  route,
  currentPosition,
  taggedLocations = [],
  onMapClick,
  height = "100%",
}: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194])


  useEffect(() => {
    if (currentPosition) {
      const newCenter: [number, number] = [currentPosition.lat, currentPosition.lng]
      setMapCenter(newCenter)
    } else if (route && route.length > 0) {
      const firstPoint = route[0]
      setMapCenter([firstPoint.latitude, firstPoint.longitude])
    }
  }, [currentPosition, route])

  const routeCoordinates: [number, number][] =
    route?.map((point) => [point.latitude, point.longitude]) || []


  // Create custom icons for tagged locations
  const createTagIcon = (color: string) => {
    return L.divIcon({
      className: "custom-tag-marker",
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} />
        {onMapClick && <MapClickHandler onClick={onMapClick} />}
        
        {currentPosition && (
          <Marker position={[currentPosition.lat, currentPosition.lng]}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#8B5CF6"
            weight={4}
            opacity={0.7}
          />
        )}

        {taggedLocations.map((location) => {
          const primaryTag = location.tags[0]?.tag
          const color = primaryTag?.color || "#8B5CF6"
          
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createTagIcon(color)}
            >
              <Popup>
                <div>
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {location.tags.map((lt) => (
                      <span
                        key={lt.tag.id}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                        style={{ backgroundColor: `${lt.tag.color}20`, color: lt.tag.color }}
                      >
                        {lt.tag.icon} {lt.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

      </MapContainer>
    </div>
  )
}

