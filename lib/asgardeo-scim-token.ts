let cached: { token: string; expiry: number } | null = null

const SCIM_LOG = "[SCIM-TOKEN]"

const DEFAULT_SCIM_SCOPES = [
  "internal_user_mgt_create",
  "internal_user_mgt_delete",
  "internal_user_mgt_list",
  "internal_user_mgt_update",
  "internal_user_mgt_view",

  "internal_org_role_mgt_delete",
  "internal_org_role_mgt_groups_update",
  "internal_org_role_mgt_meta_create",
  "internal_org_role_mgt_meta_update",
  "internal_org_role_mgt_users_update",
  "internal_org_role_mgt_view",
].join(" ")

export function getAsgardeoApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL ||
    process.env.ASGARDEO_BASE_URL ||
    ""
  ).replace(/\/$/, "")
}

export function scimRequestHeaders(
  bearerToken: string,
  withJsonBody: boolean
): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${bearerToken}`,
    Accept: "application/scim+json",
  }
  if (withJsonBody) h["Content-Type"] = "application/scim+json"
  return h
}

export async function getScimAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiry) {
    return cached.token
  }

  const clientId =
    process.env.ASGARDEO_SCIM_CLIENT_ID?.trim() ||
    process.env.ASGARDEO_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID?.trim()

  const clientSecret =
    process.env.ASGARDEO_SCIM_CLIENT_SECRET?.trim() ||
    process.env.ASGARDEO_CLIENT_SECRET?.trim()

  const baseUrl = getAsgardeoApiBase()

  if (!clientId || !clientSecret || !baseUrl) {
    const missing = [
      !clientId && "client ID",
      !clientSecret &&
        "client secret (set ASGARDEO_SCIM_CLIENT_SECRET or ASGARDEO_CLIENT_SECRET — NOT ASGARDEO_SECRET)",
      !baseUrl && "base URL",
    ]
      .filter(Boolean)
      .join(", ")
    throw new Error(`${SCIM_LOG} missing: ${missing}`)
  }

  const scope =
    process.env.ASGARDEO_MANAGEMENT_SCOPES?.trim() || DEFAULT_SCIM_SCOPES

  const tokenUrl = `${baseUrl}/oauth2/token`
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  )

  let res: Response
  try {
    res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({ grant_type: "client_credentials", scope }),
    })
  } catch (networkErr) {
    throw networkErr
  }

  const responseText = await res.text()

  if (!res.ok) {
    throw new Error(
      `${SCIM_LOG} token request failed (${res.status}): ${responseText}`
    )
  }

  const data = JSON.parse(responseText) as {
    access_token: string
    expires_in: number
    scope?: string
  }

  cached = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in - 60) * 1000,
  }

  return cached.token
}
