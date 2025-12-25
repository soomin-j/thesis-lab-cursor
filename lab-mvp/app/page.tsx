import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-purple-600">🧭 Sensory Route Tracker</h1>
            <Link
              href="/dashboard"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Track Your Walks,
              <span className="block text-purple-600"> Tag Your Feelings</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Discover how places make you feel. Track your walking routes with GPS and tag locations with sensory and mood tags to build your personal sensory map.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/walk"
                className="rounded-lg bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
              >
                Start Walking
              </Link>
              <Link
                href="/dashboard"
                className="text-base font-semibold leading-6 text-gray-900 hover:text-purple-600"
              >
                View Dashboard <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-24 max-w-7xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                <div className="mb-4 text-4xl">📍</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">GPS Tracking</h3>
                <p className="text-sm text-gray-600">
                  Record your walking routes in real-time using GPS. See your path drawn on the map as you walk.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                <div className="mb-4 text-4xl">🏷️</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Sensory Tagging</h3>
                <p className="text-sm text-gray-600">
                  Tag places with mood and sensory tags like "calm", "noisy", "bright", "crowded" to remember how they feel.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                <div className="mb-4 text-4xl">📊</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Route History</h3>
                <p className="text-sm text-gray-600">
                  View all your past walks on a map. Explore your sensory history and see patterns in your routes.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-105">
                <div className="mb-4 text-4xl">🤖</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">AI Previews</h3>
                <p className="text-sm text-gray-600">
                  Get AI-generated summaries of how places might feel based on tags from the community.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mx-auto mt-24 max-w-3xl">
            <h2 className="text-center text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="mt-12 space-y-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Start a Walk</h3>
                  <p className="mt-1 text-gray-600">
                    Begin tracking your route by starting a walk session. Your GPS location will be recorded in real-time.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tag Locations</h3>
                  <p className="mt-1 text-gray-600">
                    Tap on the map to tag interesting places with sensory tags. Multiple tags can be added to capture the full experience.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Explore History</h3>
                  <p className="mt-1 text-gray-600">
                    View all your past routes and tagged locations on an interactive map. Filter by date and explore your sensory patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Built to help you discover how places make you feel
          </p>
        </div>
      </footer>
    </div>
  )
}
