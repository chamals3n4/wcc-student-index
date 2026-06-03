import { db } from "@/db"
import { students, enrollments, classes } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"
import { studentSchema } from "@/lib/validation"
import { getAccessibleClassIds } from "@/lib/session"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: indexNumber } = await params
    const accessibleClassIds = await getAccessibleClassIds()

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

    const student = rows[0]

    // RBAC: teacher can only view students in their assigned classes
    if (
      accessibleClassIds !== null &&
      student.classId &&
      !accessibleClassIds.includes(student.classId)
    ) {
      return NextResponse.json(
        { error: "You do not have access to this student" },
        { status: 403 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
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
    const accessibleClassIds = await getAccessibleClassIds()
    const body = await req.json()
    const validated = studentSchema.parse(body)
    const { classId, ...studentData } = validated

    // RBAC: teacher can only update students in their assigned classes
    // First, check the student's current class
    const [existing] = await db
      .select({ classId: enrollments.classId })
      .from(students)
      .leftJoin(enrollments, eq(enrollments.studentId, students.id))
      .where(
        and(
          eq(students.indexNumber, indexNumber),
          eq(enrollments.status, "active")
        )
      )

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (
      accessibleClassIds !== null &&
      (!existing.classId ||
        !accessibleClassIds.includes(existing.classId) ||
        !accessibleClassIds.includes(classId))
    ) {
      return NextResponse.json(
        { error: "You do not have access to this class" },
        { status: 403 }
      )
    }

    await db.transaction(async (tx) => {
      await tx
        .update(students)
        .set(studentData)
        .where(eq(students.indexNumber, indexNumber))

      const [student] = await tx
        .select({ id: students.id })
        .from(students)
        .where(eq(students.indexNumber, indexNumber))

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
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
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
    const accessibleClassIds = await getAccessibleClassIds()

    // RBAC: teacher can only delete students in their assigned classes
    const [existing] = await db
      .select({ classId: enrollments.classId })
      .from(students)
      .leftJoin(enrollments, eq(enrollments.studentId, students.id))
      .where(
        and(
          eq(students.indexNumber, indexNumber),
          eq(enrollments.status, "active")
        )
      )

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (
      accessibleClassIds !== null &&
      (!existing.classId || !accessibleClassIds.includes(existing.classId))
    ) {
      return NextResponse.json(
        { error: "You do not have access to this student" },
        { status: 403 }
      )
    }

    await db.delete(students).where(eq(students.indexNumber, indexNumber))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 400 }
    )
  }
}
