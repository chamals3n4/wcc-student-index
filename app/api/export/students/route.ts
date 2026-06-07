import { NextResponse } from "next/server"
import { db } from "@/db"
import { students, enrollments, classes } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { requireRole } from "@/lib/session"
import * as XLSX from "xlsx"

export async function GET(req: Request) {
  try {
    // RBAC — super_admin only
    await requireRole("super_admin")

    const { searchParams } = new URL(req.url)
    const grade = searchParams.get("grade")
    const section = searchParams.get("section")
    const stream = searchParams.get("stream")
    const academicYear =
      searchParams.get("year") || new Date().getFullYear().toString()

    let query = db
      .select({
        id: students.id,
        name: students.name,
        indexNumber: students.indexNumber,
        address: students.address,
        birthDay: students.birthDay,
        contactNo: students.contactNo,
        guardianName: students.guardianName,
        siblingsAtSchool: students.siblingsAtSchool,
        specialRemarks: students.specialRemarks,
        createdAt: students.createdAt,
        grade: classes.grade,
        section: classes.section,
        stream: classes.stream,
        academicYear: classes.academicYear,
      })
      .from(students)
      .innerJoin(enrollments, eq(students.id, enrollments.studentId))
      .innerJoin(classes, eq(enrollments.classId, classes.id))

    const conditions = [
      eq(enrollments.status, "active"),
      eq(classes.academicYear, academicYear),
    ]

    if (grade) conditions.push(eq(classes.grade, parseInt(grade)))
    if (section) conditions.push(eq(classes.section, section))
    if (stream) {
      conditions.push(
        eq(classes.stream, stream as "Maths" | "Bio" | "Commerce" | "Art")
      )
    }

    // @ts-ignore — drizzle dynamic where
    const data = await query.where(and(...conditions))

    if (data.length === 0) {
      return NextResponse.json(
        { error: "No students found for the selected criteria" },
        { status: 404 }
      )
    }

    //sa
    // SORT: Grade asc → Stream asc (nulls first) → Section asc → IndexNumber asc
    const sortedData = data.sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade
      if (a.stream !== b.stream) {
        if (!a.stream) return -1
        if (!b.stream) return 1
        return a.stream.localeCompare(b.stream)
      }
      if (a.section !== b.section) return a.section.localeCompare(b.section)
      return a.indexNumber.localeCompare(b.indexNumber)
    })

    const rows = sortedData.map((s) => ({
      "Index Number": s.indexNumber,
      Name: s.name,
      Address: s.address,
      "Birth Day": s.birthDay,
      "Contact No": s.contactNo,
      "Guardian Name": s.guardianName || "",
      "Siblings at School": s.siblingsAtSchool || "",
      "Special Remarks": s.specialRemarks || "",
      Grade: s.grade,
      Section: s.section,
      Stream: s.stream || "",
      "Academic Year": s.academicYear,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)

    // Set column widths so text is readable and not overlapping
    worksheet["!cols"] = [
      { wch: 14 }, // Index Number
      { wch: 28 }, // Name
      { wch: 38 }, // Address
      { wch: 12 }, // Birth Day
      { wch: 14 }, // Contact No
      { wch: 24 }, // Guardian Name
      { wch: 28 }, // Siblings at School
      { wch: 28 }, // Special Remarks
      { wch: 8 }, // Grade
      { wch: 10 }, // Section
      { wch: 12 }, // Stream
      { wch: 14 }, // Academic Year
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    let filename = `students_${academicYear}`
    if (grade) filename += `_grade-${grade}`
    if (stream) filename += `_stream-${stream}`
    if (section) filename += `_section-${section}`
    filename += ".xlsx"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message === "Forbidden")
    ) {
      const status = error.message === "Forbidden" ? 403 : 401
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export students" },
      { status: 500 }
    )
  }
}
