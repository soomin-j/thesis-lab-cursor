// Simple user management without authentication
// Uses localStorage to persist a user ID

const DEFAULT_USER_ID = "default-user"

export function getUserId(): string {
  if (typeof window === "undefined") {
    return DEFAULT_USER_ID
  }

  // Get or create user ID from localStorage
  let userId = localStorage.getItem("sensory-route-user-id")
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("sensory-route-user-id", userId)
  }
  return userId
}

export function getUserName(): string {
  if (typeof window === "undefined") {
    return "User"
  }
  return localStorage.getItem("sensory-route-user-name") || "User"
}

export function setUserName(name: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("sensory-route-user-name", name)
  }
}




