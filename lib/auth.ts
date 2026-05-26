import { cache } from "react"
import { asgardeo } from "@asgardeo/nextjs/server"

const getAuthContext = cache(async () => {
  const client = await asgardeo()
  const sessionId = await client.getSessionId()
  if (!sessionId) throw new Error("Unauthorized")
  const token = await client.getAccessToken(sessionId)
  return token
})

export async function getAccessToken() {
  try {
    return await getAuthContext()
  } catch {
    return null
  }
}

export async function requireAuth() {
  const token = await getAccessToken()
  if (!token) throw new Error("Unauthorized")
  return token
}
