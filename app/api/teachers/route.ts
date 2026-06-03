import { NextResponse } from "next/server"
import { asgardeo } from "@asgardeo/nextjs/server"
import { db } from "@/db"
import { teachers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { assignAsgardeoRole } from "@/lib/asgardeo-roles"
import {
  getAsgardeoApiBase,
  getScimAccessToken,
  scimRequestHeaders,
} from "@/lib/asgardeo-scim-token"
import { z } from "zod"

const ROUTE_LOG = "[API /teachers]"

async function requireSignedIn() {
  const client = await asgardeo()
  const sessionId = await client.getSessionId()
  if (!sessionId) throw new Error("Unauthorized")
}

const createTeacherSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  // "set_password" = admin sets it now, "invite" = email invite to set own
  mode: z.enum(["set_password", "invite"]),
  password: z.string().optional(),
})

export async function GET() {
  try {
    const data = await db.select().from(teachers)
    return NextResponse.json(data)
  } catch (error) {
    console.error(`${ROUTE_LOG} GET error:`, error)
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  console.log(`${ROUTE_LOG} POST /api/teachers`)
  try {
    await requireSignedIn()
    const scimToken = await getScimAccessToken()
    const body = await req.json()
    const validated = createTeacherSchema.parse(body)

    if (validated.mode === "set_password" && !validated.password) {
      return NextResponse.json(
        { error: "Password is required when mode is set_password" },
        { status: 400 }
      )
    }

    const base = getAsgardeoApiBase()

    // SCIM body based on mode
    const scimBody: Record<string, unknown> = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      name: {
        givenName: validated.firstName,
        familyName: validated.lastName,
      },
      // asgardeo userName must be DEFAULT/<email>
      userName: `DEFAULT/${validated.email}`,
      emails: [{ primary: true, value: validated.email }],
    }

    if (validated.mode === "invite") {
      // sends email to user to set their own password
      scimBody["urn:scim:wso2:schema"] = { askPassword: true }
    } else {
      scimBody.password = validated.password
      // ask to verify the password
      //scimBody["urn:scim:wso2:schema"] = { verifyEmail: true }
    }

    console.log(
      `${ROUTE_LOG} creating Asgardeo user — email: ${validated.email}, mode: ${validated.mode}`
    )

    const scimRes = await fetch(`${base}/scim2/Users`, {
      method: "POST",
      headers: scimRequestHeaders(scimToken, true),
      body: JSON.stringify(scimBody),
    })

    if (!scimRes.ok) {
      const err = await scimRes.json()
      console.error(
        `${ROUTE_LOG} Asgardeo create failed — HTTP ${scimRes.status}:`,
        err
      )
      return NextResponse.json(
        { error: err.detail ?? "Failed to create user in Asgardeo" },
        { status: scimRes.status }
      )
    }

    const scimUser = await scimRes.json()
    console.log(`${ROUTE_LOG} Asgardeo user created — id: ${scimUser.id}`)

    // assign teacher rolw
    await assignAsgardeoRole(scimToken, scimUser.id, "teacher")

    // sync to the DB
    const [teacher] = await db
      .insert(teachers)
      .values({
        asgardeoUserId: scimUser.id,
        name: `${validated.firstName} ${validated.lastName}`,
        email: validated.email,
      })
      .returning()

    console.log(`${ROUTE_LOG} teacher synced to DB — id: ${teacher.id}`)
    return NextResponse.json({ success: true, data: teacher }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : String(error)
    const status = msg === "Unauthorized" ? 401 : 500
    console.error(`${ROUTE_LOG} POST error:`, msg)
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(req: Request) {
  console.log(`${ROUTE_LOG} DELETE /api/teachers`)
  try {
    await requireSignedIn()
    const scimToken = await getScimAccessToken()
    const { id } = await req.json()
    const base = getAsgardeoApiBase()

    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, id))

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    if (teacher.asgardeoUserId !== "pending") {
      const scimRes = await fetch(
        `${base}/scim2/Users/${teacher.asgardeoUserId}`,
        {
          method: "DELETE",
          headers: scimRequestHeaders(scimToken, false),
        }
      )

      if (!scimRes.ok && scimRes.status !== 404) {
        const err = await scimRes.text()
        console.error(
          `${ROUTE_LOG} Asgardeo delete failed — HTTP ${scimRes.status}:`,
          err
        )
        return NextResponse.json({ error: err }, { status: scimRes.status })
      }

      console.log(`${ROUTE_LOG} Asgardeo user deleted`)
    }

    await db.delete(teachers).where(eq(teachers.id, id))
    console.log(`${ROUTE_LOG} teacher removed from DB`)

    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const status = msg === "Unauthorized" ? 401 : 500
    console.error(`${ROUTE_LOG} DELETE error:`, msg)
    return NextResponse.json({ error: msg }, { status })
  }
}
