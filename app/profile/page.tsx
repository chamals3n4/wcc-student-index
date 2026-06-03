import { asgardeo } from "@asgardeo/nextjs/server"
import Image from "next/image"

function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))
  } catch {
    return null
  }
}

export default async function ProfilePage() {
  const client = await asgardeo()

  const sessionId = await client.getSessionId()
  if (!sessionId) {
    return <p className="p-6 text-neutral-500">You are not signed in.</p>
  }

  const accessToken = await client.getAccessToken(sessionId)
  const claims = decodeJWT(accessToken)
  const APP_ROLES = ["super_admin", "teacher"]

  if (!claims) {
    return <p className="p-6 text-neutral-500">You are not signed in.</p>
  }

  const fullName = claims.given_name
    ? `${claims.given_name} ${claims.family_name ?? ""}`.trim()
    : (claims.username ?? claims.sub ?? "User")

  const gravatarUrl = claims.profile ?? null
  const country = claims.address?.country ?? null
  const roles = (claims.roles ?? []).filter((role: string) =>
    APP_ROLES.includes(role)
  )

  return (
    <div className="w-full px-8 py-2">
      <div className="mb-8">
        <h1 className="text-lg font-medium text-neutral-900 dark:text-white">
          My Profile
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Your personal information from your identity provider.
        </p>
      </div>

      {/* Avatar card */}
      <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-5">
          {gravatarUrl ? (
            <Image
              src={gravatarUrl}
              alt={fullName}
              width={64}
              height={64}
              className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xl font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-neutral-900 dark:text-white">
              {fullName}
            </p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {claims.email ||
                claims.username?.replace("DEFAULT/", "") ||
                claims.sub}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.map((role: string) => (
                <span
                  key={role}
                  className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="mb-4 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 px-6 py-3.5 dark:border-neutral-800">
          <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
            Personal information
          </p>
        </div>
        <ProfileRow label="Full name" value={fullName} />
        <ProfileRow
          label="Email address"
          value={
            claims.email ||
            claims.username?.replace("DEFAULT/", "") ||
            claims.sub
          }
        />
        <ProfileRow label="Country" value={country} last />
      </div>
    </div>
  )
}

function ProfileRow({
  label,
  value,
  last = false,
}: {
  label: string
  value?: string | null
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 ${!last ? "border-b border-neutral-100 dark:border-neutral-800" : ""}`}
    >
      <p className="w-40 flex-shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="text-right text-sm text-neutral-900 dark:text-neutral-100">
        {value ?? <span className="text-neutral-400">—</span>}
      </p>
    </div>
  )
}
