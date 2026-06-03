import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import type { AppRole } from "@/lib/session"

export interface SessionResponse {
  signedIn: boolean
  roles: AppRole[]
  teacherDbId: string | null
  assignedClassIds: string[]
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({
        signedIn: false,
        roles: [],
        teacherDbId: null,
        assignedClassIds: [],
      } satisfies SessionResponse)
    }

    return NextResponse.json({
      signedIn: true,
      roles: session.roles,
      teacherDbId: session.teacherDbId,
      assignedClassIds: session.assignedClassIds,
    } satisfies SessionResponse)
  } catch {
    return NextResponse.json({
      signedIn: false,
      roles: [],
      teacherDbId: null,
      assignedClassIds: [],
    } satisfies SessionResponse)
  }
}
