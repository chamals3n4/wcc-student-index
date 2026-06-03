import { cache } from "react"
import { asgardeo } from "@asgardeo/nextjs/server"
import { db } from "@/db"
import { teachers, classTeachers } from "@/db/schema"
import { eq } from "drizzle-orm"

export type AppRole = "super_admin" | "teacher"

interface SessionUser {
  asgardeoUserId: string
  roles: AppRole[]
  /** Present only for teachers — their DB teacher record ID */
  teacherDbId: string | null
  /** Present only for teachers — the class IDs they are assigned to */
  assignedClassIds: string[]
}

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))
  } catch {
    return null
  }
}

const APP_ROLES: AppRole[] = ["super_admin", "teacher"]

const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const client = await asgardeo()
    const sessionId = await client.getSessionId()
    if (!sessionId) return null

    const token = await client.getAccessToken(sessionId)
    const claims = decodeJWT(token)
    if (!claims) return null

    const asgardeoUserId = claims.sub as string
    const rawRoles = (claims.roles ?? []) as string[]
    const roles = rawRoles.filter((r): r is AppRole =>
      APP_ROLES.includes(r as AppRole)
    )

    // Look up teacher DB record and assigned classes
    let teacherDbId: string | null = null
    let assignedClassIds: string[] = []

    if (roles.includes("teacher")) {
      const [teacher] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.asgardeoUserId, asgardeoUserId))

      if (teacher) {
        teacherDbId = teacher.id

        const assignments = await db
          .select({ classId: classTeachers.classId })
          .from(classTeachers)
          .where(eq(classTeachers.teacherId, teacher.id))

        assignedClassIds = assignments.map((a) => a.classId)
      }
    }

    return { asgardeoUserId, roles, teacherDbId, assignedClassIds }
  } catch {
    return null
  }
})

export async function getSession(): Promise<SessionUser | null> {
  return getSessionUser()
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser()
  if (!session) throw new Error("Unauthorized")
  return session
}

export async function requireRole(...allowed: AppRole[]): Promise<SessionUser> {
  const session = await requireSession()
  const hasRole = session.roles.some((r) => allowed.includes(r))
  if (!hasRole) throw new Error("Forbidden")
  return session
}

/**
 * For teachers: returns the list of class IDs they can access.
 * For super_admin: returns null (meaning all classes).
 */
export async function getAccessibleClassIds(): Promise<string[] | null> {
  const session = await getSessionUser()
  if (!session) throw new Error("Unauthorized")

  if (session.roles.includes("super_admin")) return null // all classes
  if (session.roles.includes("teacher")) return session.assignedClassIds

  throw new Error("Forbidden")
}

/**
 * Check if the current user can access a specific class.
 * Super admins can access all. Teachers can only access their assigned classes.
 */
export async function canAccessClass(classId: string): Promise<boolean> {
  const session = await getSessionUser()
  if (!session) return false
  if (session.roles.includes("super_admin")) return true
  return session.assignedClassIds.includes(classId)
}
