import { NextResponse } from "next/server"
import { db } from "@/db"
import { students, enrollments, classes } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { studentSchema } from "@/lib/validation"
import { getAccessibleClassIds, canAccessClass } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = studentSchema.parse(body)
    const { classId, ...studentData } = validated

    // RBAC: teacher can only add students to their assigned classes
    const allowed = await canAccessClass(classId)
    if (!allowed) {
      return NextResponse.json(
        { error: "You are not assigned to this class" },
        { status: 403 }
      )
    }

    const result = await db.transaction(async (tx) => {
      const [student] = await tx
        .insert(students)
        .values(studentData)
        .returning()

      await tx.insert(enrollments).values({
        studentId: student.id,
        classId,
        status: "active",
      })

      return student
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 400 }
    )
  }
}

export async function GET() {
  try {
    const accessibleClassIds = await getAccessibleClassIds()

    // Build the where clause
    const baseWhere = eq(enrollments.status, "active")

    const data = await db
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
        // super_admin → accessibleClassIds is null → show all
        // teacher → only students in their assigned classes
        accessibleClassIds === null
          ? baseWhere
          : and(baseWhere, inArray(enrollments.classId, accessibleClassIds))
      )

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
