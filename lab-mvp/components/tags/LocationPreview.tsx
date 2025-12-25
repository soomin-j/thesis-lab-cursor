"use client"

import { useState, useEffect } from "react"

interface LocationPreviewProps {
  latitude: number
  longitude: number
  onClose: () => void
}

export function LocationPreview({
  latitude,
  longitude,
  onClose,
}: LocationPreviewProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [tagAggregate, setTagAggregate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(
      `/api/ai/summary?latitude=${latitude}&longitude=${longitude}&radius=50`
    )
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary)
        setTagAggregate(data.tagAggregate || {})
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching location summary:", error)
        setLoading(false)
      })
  }, [latitude, longitude])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Location Preview</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading preview...</div>
        ) : (
          <>
            {summary && (
              <div className="mb-4 rounded-lg bg-purple-50 p-4">
                <p className="text-sm leading-relaxed text-gray-700">
                  {summary}
                </p>
              </div>
            )}

            {Object.keys(tagAggregate).length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Common tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tagAggregate)
                    .sort(([, a], [, b]) => b - a)
                    .map(([tag, count]) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                      >
                        {tag} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}

            {!summary && Object.keys(tagAggregate).length === 0 && (
              <div className="py-4 text-center text-gray-500">
                No information available for this location yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}




