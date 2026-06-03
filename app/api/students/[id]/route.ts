import { db } from "@/db"
import { students, enrollments, classes } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"
import { studentSchema } from "@/lib/validation"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: indexNumber } = await params

    const rows = await db
      .select({
        id: students.id,
        name: students.name,
        imageUrl: students.imageUrl,
        indexNumber: students.indexNumber,
        address: students.address,
        birthDay: students.birthDay,
        specialRemarks: students.specialRemarks,
        contactNo: students.contactNo,
        guardianName: students.guardianName,
        siblingsAtSchool: students.siblingsAtSchool,
        createdAt: students.createdAt,
        enrollmentId: enrollments.id,
        enrollmentStatus: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        classId: classes.id,
        academicYear: classes.academicYear,
        grade: classes.grade,
        section: classes.section,
        stream: classes.stream,
      })
      .from(students)
      .leftJoin(enrollments, eq(enrollments.studentId, students.id))
      .leftJoin(classes, eq(classes.id, enrollments.classId))
      .where(
        and(
          eq(students.indexNumber, indexNumber),
          eq(enrollments.status, "active")
        )
      )

    if (!rows.length) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: indexNumber } = await params
    const body = await req.json()
    const validated = studentSchema.parse(body)
    const { classId, ...studentData } = validated

    await db.transaction(async (tx) => {
      // Update core student fields
      await tx
        .update(students)
        .set(studentData)
        .where(eq(students.indexNumber, indexNumber))

      // Get the student id for enrollment lookup
      const [student] = await tx
        .select({ id: students.id })
        .from(students)
        .where(eq(students.indexNumber, indexNumber))

      // Update the active enrollment's classId if it changed
      await tx
        .update(enrollments)
        .set({ classId })
        .where(
          and(
            eq(enrollments.studentId, student.id),
            eq(enrollments.status, "active")
          )
        )
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: indexNumber } = await params
    // cascades to enrollments automatically via onDelete: "cascade"
    await db.delete(students).where(eq(students.indexNumber, indexNumber))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 400 }
    )
  }
}
