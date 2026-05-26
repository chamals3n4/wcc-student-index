import { db } from "@/db"
import { students } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { studentSchema } from "@/lib/validation"
import { requireAuth } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id: indexNumber } = await params
    const student = await db
      .select()
      .from(students)
      .where(eq(students.indexNumber, indexNumber))
    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id: indexNumber } = await params
    const body = await req.json()
    const validated = studentSchema.parse(body)
    await db
      .update(students)
      .set(validated)
      .where(eq(students.indexNumber, indexNumber))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id: indexNumber } = await params
    await db.delete(students).where(eq(students.indexNumber, indexNumber))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 400 }
    )
  }
}
