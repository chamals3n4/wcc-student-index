import { NextResponse } from "next/server"
import { db } from "@/db"
import { classTeachers, teachers, classes } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const teacherId = searchParams.get("teacherId")

    const rows = await db
      .select({
        id: classTeachers.id,
        assignedAt: classTeachers.assignedAt,
        classId: classes.id,
        academicYear: classes.academicYear,
        grade: classes.grade,
        section: classes.section,
        stream: classes.stream,
        teacherId: teachers.id,
        teacherName: teachers.name,
        teacherEmail: teachers.email,
      })
      .from(classTeachers)
      .innerJoin(teachers, eq(teachers.id, classTeachers.teacherId))
      .innerJoin(classes, eq(classes.id, classTeachers.classId))
      .$dynamic()

    const filtered = classId
      ? rows.filter((r) => r.classId === classId)
      : teacherId
        ? rows.filter((r) => r.teacherId === teacherId)
        : rows

    return NextResponse.json(filtered)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { classId, teacherId } = await req.json()
    if (!classId || !teacherId) {
      return NextResponse.json(
        { error: "classId and teacherId required" },
        { status: 400 }
      )
    }
    const [created] = await db
      .insert(classTeachers)
      .values({ classId, teacherId })
      .returning()
    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to assign teacher" },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await db.delete(classTeachers).where(eq(classTeachers.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to unassign teacher" },
      { status: 400 }
    )
  }
}
