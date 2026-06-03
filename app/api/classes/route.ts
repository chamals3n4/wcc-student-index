import { NextResponse } from "next/server"
import { db } from "@/db"
import { classes } from "@/db/schema"
import { eq } from "drizzle-orm"
import { classSchema } from "@/lib/validation"
import { z } from "zod"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year")

    const query = db.select().from(classes)
    const data = year
      ? await db.select().from(classes).where(eq(classes.academicYear, year))
      : await query

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Accept single object or array
    const isBulk = Array.isArray(body)
    const bulkSchema = z.array(classSchema)
    const rows = isBulk ? bulkSchema.parse(body) : [classSchema.parse(body)]

    const created = await db.insert(classes).values(rows).returning()
    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create class(es)" },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await db.delete(classes).where(eq(classes.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 400 }
    )
  }
}
