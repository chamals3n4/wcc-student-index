import { NextResponse } from "next/server"
import { db } from "@/db"
import { students, enrollments, classes } from "@/db/schema"
import { eq } from "drizzle-orm"
import { studentSchema } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = studentSchema.parse(body)
    const { classId, ...studentData } = validated

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
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 400 }
    )
  }
}

export async function GET() {
  try {
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
      // only pull active enrollment — one row per student
      .where(eq(enrollments.status, "active"))

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
