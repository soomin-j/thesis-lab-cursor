import { openDB, DBSchema, IDBPDatabase } from "idb"

interface RouteDB extends DBSchema {
  routes: {
    key: string
    value: {
      id: string
      userId: string
      startTime: string
      endTime: string | null
      polyline: string
      distance: number | null
      locations: Array<{
        id: string
        latitude: number
        longitude: number
        timestamp: string
        tags: Array<{
          tagId: string
        }>
      }>
      synced: boolean
    }
    indexes: { byUserId: string; bySynced: boolean }
  }
  locations: {
    key: string
    value: {
      id: string
      routeId: string | null
      userId: string
      latitude: number
      longitude: number
      timestamp: string
      tags: Array<{ tagId: string }>
      synced: boolean
    }
    indexes: { byUserId: string; bySynced: boolean }
  }
}

let dbInstance: IDBPDatabase<RouteDB> | null = null

export async function getDB(): Promise<IDBPDatabase<RouteDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<RouteDB>("sensory-routes", 1, {
    upgrade(db) {
      const routeStore = db.createObjectStore("routes", {
        keyPath: "id",
      })
      routeStore.createIndex("byUserId", "userId")
      routeStore.createIndex("bySynced", "synced")

      const locationStore = db.createObjectStore("locations", {
        keyPath: "id",
      })
      locationStore.createIndex("byUserId", "userId")
      locationStore.createIndex("bySynced", "synced")
    },
  })

  return dbInstance
}

export async function saveRouteOffline(route: RouteDB["routes"]["value"]) {
  const db = await getDB()
  await db.put("routes", { ...route, synced: false })
}

export async function saveLocationOffline(
  location: RouteDB["locations"]["value"]
) {
  const db = await getDB()
  await db.put("locations", { ...location, synced: false })
}

export async function getUnsyncedRoutes(userId: string) {
  const db = await getDB()
  return db.getAllFromIndex("routes", "bySynced", false)
}

export async function getUnsyncedLocations(userId: string) {
  const db = await getDB()
  return db.getAllFromIndex("locations", "bySynced", false)
}

export async function markRouteSynced(routeId: string) {
  const db = await getDB()
  const route = await db.get("routes", routeId)
  if (route) {
    await db.put("routes", { ...route, synced: true })
  }
}

export async function markLocationSynced(locationId: string) {
  const db = await getDB()
  const location = await db.get("locations", locationId)
  if (location) {
    await db.put("locations", { ...location, synced: true })
  }
}

export async function syncOfflineData(userId: string) {
  const routes = await getUnsyncedRoutes(userId)
  const locations = await getUnsyncedLocations(userId)

  // Sync routes
  for (const route of routes) {
    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: route.startTime,
          endTime: route.endTime,
          polyline: route.polyline,
          distance: route.distance,
        }),
      })

      if (response.ok) {
        const savedRoute = await response.json()
        // Update route ID and mark as synced
        await markRouteSynced(route.id)
        // Update location routeIds
        for (const location of route.locations) {
          const locationData = await dbInstance?.get(
            "locations",
            location.id
          )
          if (locationData) {
            await saveLocationOffline({
              ...locationData,
              routeId: savedRoute.id,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error syncing route:", error)
    }
  }

  // Sync locations
  for (const location of locations) {
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          routeId: location.routeId,
          timestamp: location.timestamp,
        }),
      })

      if (response.ok) {
        const savedLocation = await response.json()
        await markLocationSynced(location.id)

        // Sync tags
        for (const tag of location.tags) {
          try {
            await fetch(`/api/locations/${savedLocation.id}/tags`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tagId: tag.tagId }),
            })
          } catch (error) {
            console.error("Error syncing tag:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error syncing location:", error)
    }
  }
}




