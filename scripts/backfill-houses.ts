import "dotenv/config"

import { db } from "../db"
import { students } from "../db/schema"
import { getHouseFromIndexNumber } from "../lib/house"
import { eq } from "drizzle-orm"

async function backfill() {
  const allStudents = await db.select().from(students)

  for (const student of allStudents) {
    const houseName = getHouseFromIndexNumber(student.indexNumber)
    await db
      .update(students)
      .set({ houseName })
      .where(eq(students.id, student.id))
  }

  console.log(
    `Backfilled ${allStudents.length} students with house assignments.`
  )
  process.exit(0)
}

backfill().catch((err) => {
  console.error("Backfill failed:", err)
  process.exit(1)
})
