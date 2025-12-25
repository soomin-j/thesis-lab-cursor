"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Route {
  id: string
  startTime: string
  endTime: string | null
  distance: number | null
  createdAt: string
}

export default function DashboardPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/routes")
      .then((res) => res.json())
      .then((data) => {
        setRoutes(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching routes:", error)
        setLoading(false)
      })
  }, [])

  const formatDistance = (meters: number | null) => {
    if (!meters) return "0 km"
    return `${(meters / 1000).toFixed(2)} km`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
        <header className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Sensory Route Tracker
            </h1>
            <Link
              href="/"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Home
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Track your walks and discover how places make you feel
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/walk"
              className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg transition-transform hover:scale-105"
            >
              <span className="mb-2 text-4xl">🚶</span>
              <span className="text-lg font-semibold">Start Walking</span>
            </Link>
            <Link
              href="/history"
              className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-transform hover:scale-105"
            >
              <span className="mb-2 text-4xl">📊</span>
              <span className="text-lg font-semibold">View History</span>
            </Link>
          </div>

          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Routes
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  Loading routes...
                </div>
              ) : routes.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No routes yet. Start walking to record your first route!
                </div>
              ) : (
                routes.slice(0, 5).map((route) => (
                  <Link
                    key={route.id}
                    href={`/history?route=${route.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(route.startTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDistance(route.distance)}
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>

        <nav className="border-t border-gray-200 bg-white px-4 py-2">
          <div className="flex justify-around">
            <Link
              href="/dashboard"
              className="flex flex-col items-center rounded-lg px-4 py-2 text-purple-600"
            >
              <span className="text-xs">Home</span>
            </Link>
            <Link
              href="/walk"
              className="flex flex-col items-center rounded-lg px-4 py-2 text-gray-600"
            >
              <span className="text-xs">Walk</span>
            </Link>
            <Link
              href="/history"
              className="flex flex-col items-center rounded-lg px-4 py-2 text-gray-600"
            >
              <span className="text-xs">History</span>
            </Link>
          </div>
        </nav>
      </div>
  )
}

