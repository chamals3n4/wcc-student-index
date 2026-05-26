import { NextResponse } from "next/server"

import { db } from "@/db"
import { students } from "@/db/schema"
import { studentSchema } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validated = studentSchema.parse(body)

    await db.insert(students).values(validated)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create student",
      },
      {
        status: 400,
      }
    )
  }
}

export async function GET() {
  try {
    const data = await db.select().from(students)

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch",
      },
      {
        status: 500,
      }
    )
  }
}
