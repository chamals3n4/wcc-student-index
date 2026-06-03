import { getAsgardeoApiBase, scimRequestHeaders } from "./asgardeo-scim-token"

const ROLES_LOG = "[SCIM-ROLES]"

function getRoleId(role: string): string | null {
  switch (role) {
    case "super_admin":
      return process.env.ASGARDEO_SUPER_ADMIN_ROLE_ID!
    case "teacher":
      return process.env.ASGARDEO_TEACHER_ROLE_ID!
    default:
      return null
  }
}

export async function assignAsgardeoRole(
  token: string,
  asgardeoUserId: string,
  role: string
): Promise<void> {
  const roleId = getRoleId(role)
  if (!roleId) return

  const base = getAsgardeoApiBase()

  const url = `${base}/o/scim2/v2/Roles/${roleId}`

  const res = await fetch(url, {
    method: "PATCH",
    headers: scimRequestHeaders(token, true),
    body: JSON.stringify({
      schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
      Operations: [
        { op: "add", path: "users", value: [{ value: asgardeoUserId }] },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(
      `${ROLES_LOG} assign "${role}" failed (${res.status}): ${body}`
    )
  }

  console.log(`${ROLES_LOG} role "${role}" assigned`)
}

export async function removeAsgardeoRole(
  token: string,
  asgardeoUserId: string,
  role: string
): Promise<void> {
  const roleId = getRoleId(role)
  if (!roleId) return

  const base = getAsgardeoApiBase()
  const url = `${base}/o/scim2/v2/Roles/${roleId}`
  console.log(
    `${ROLES_LOG} removing role "${role}" (${roleId}) from ${asgardeoUserId}`
  )

  const res = await fetch(url, {
    method: "PATCH",
    headers: scimRequestHeaders(token, true),
    body: JSON.stringify({
      schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
      Operations: [
        { op: "remove", path: "users", value: [{ value: asgardeoUserId }] },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(
      `${ROLES_LOG} remove "${role}" failed (${res.status}): ${body}`
    )
  }

  console.log(`${ROLES_LOG} role "${role}" removed`)
}
