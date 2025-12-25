import { NextRequest } from "next/server"

// Default user ID for demo purposes
const DEFAULT_USER_ID = "default-user"

export function getUserIdFromRequest(request: NextRequest): string {
  // Get user ID from header or use default
  const userId = request.headers.get("x-user-id") || DEFAULT_USER_ID
  return userId
}




