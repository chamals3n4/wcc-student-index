"use client"

import { useQuery } from "@tanstack/react-query"
import type { SessionResponse } from "@/app/api/auth/me/route"

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/auth/me")
  if (!res.ok) {
    return { signedIn: false, roles: [], teacherDbId: null, assignedClassIds: [] }
  }
  return res.json()
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 min — roles rarely change mid-session
    refetchOnWindowFocus: false,
  })
}
