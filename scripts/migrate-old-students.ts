// import old students into new relational schema.
// pnpm tsx scripts/migrate-old-students.ts

import { db } from "../db"
import { students, classes, enrollments } from "../db/schema"
import { eq, and } from "drizzle-orm"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface OldStudent {
  id: string
  name: string
  image_url: string | null
  index_number: string
  address: string
  birth_day: string
  current_grade: string
  special_remarks: string
  contact_no: string
  created_at: string
  guardian_name: string
  siblings_at_school: string
}

function parseGrade(gradeStr: string) {
  const match = gradeStr.match(/Grade\s+(\d+)/)
  if (!match) throw new Error(`Cannot parse: "${gradeStr}"`)
  return { grade: parseInt(match[1], 10), section: "A" }
}

async function migrate() {
  const raw = fs.readFileSync(
    path.join(__dirname, "..", "students.json"),
    "utf-8"
  )
  const oldStudents: OldStudent[] = JSON.parse(raw)
  console.log(`Found ${oldStudents.length} students\n`)

  const classCache = new Map<string, string>()
  let inserted = 0,
    skipped = 0

  for (const old of oldStudents) {
    const { grade, section } = parseGrade(old.current_grade)
    const academicYear = "2026"
    const classKey = `${academicYear}-${grade}-${section}`

    // Find or create class
    let classId = classCache.get(classKey)
    if (!classId) {
      const [existing] = await db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.academicYear, academicYear),
            eq(classes.grade, grade),
            eq(classes.section, section)
          )
        )
      if (existing) {
        classId = existing.id
      } else {
        const [c] = await db
          .insert(classes)
          .values({ academicYear, grade, section })
          .returning()
        classId = c.id
        console.log(`  Created class: Grade ${grade}-${section}`)
      }
      classCache.set(classKey, classId)
    }

    // Skip duplicates
    const [dup] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.indexNumber, old.index_number))
    if (dup) {
      skipped++
      continue
    }

    // Insert student
    const [s] = await db
      .insert(students)
      .values({
        name: old.name,
        imageUrl: old.image_url ?? null,
        indexNumber: old.index_number,
        address: old.address,
        birthDay: old.birth_day,
        specialRemarks: old.special_remarks || null,
        contactNo: old.contact_no,
        guardianName: old.guardian_name || null,
        siblingsAtSchool: old.siblings_at_school || null,
      })
      .returning()

    // Enroll
    await db.insert(enrollments).values({
      studentId: s.id,
      classId,
      status: "active",
    })

    inserted++
    console.log(`  ${old.index_number} -> Grade ${grade}-${section}`)
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`)
  process.exit(0)
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
