"use client"

import dynamic from "next/dynamic"

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

export default MapView




