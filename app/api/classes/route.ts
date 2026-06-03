import { NextResponse } from "next/server"
import { db } from "@/db"
import { classes } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { classSchema } from "@/lib/validation"
import { requireRole, getAccessibleClassIds } from "@/lib/session"
import { z } from "zod"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year")

    const accessibleClassIds = await getAccessibleClassIds()

    // Teacher — scoped to their assigned classes only
    if (accessibleClassIds !== null) {
      // Edge case: teacher exists but has no classes assigned yet
      if (accessibleClassIds.length === 0) {
        return NextResponse.json([])
      }

      const data = await db
        .select()
        .from(classes)
        .where(
          year
            ? and(
                inArray(classes.id, accessibleClassIds),
                eq(classes.academicYear, year)
              )
            : inArray(classes.id, accessibleClassIds)
        )

      return NextResponse.json(data)
    }

    // Super admin — all classes, optionally filtered by year
    const data = year
      ? await db.select().from(classes).where(eq(classes.academicYear, year))
      : await db.select().from(classes)

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("super_admin")

    const body = await req.json()
    const isBulk = Array.isArray(body)
    const bulkSchema = z.array(classSchema)
    const rows = isBulk ? bulkSchema.parse(body) : [classSchema.parse(body)]

    const created = await db.insert(classes).values(rows).returning()
    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message === "Forbidden")
    ) {
      const status = error.message === "Forbidden" ? 403 : 401
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create class(es)" },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole("super_admin")

    const { id } = await req.json()
    await db.delete(classes).where(eq(classes.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message === "Forbidden")
    ) {
      const status = error.message === "Forbidden" ? 403 : 401
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 400 }
    )
  }
}
