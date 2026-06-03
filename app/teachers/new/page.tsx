"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCreateTeacher } from "@/hooks/use-students"
import { useSession } from "@/hooks/use-session"
import { TeacherFormPage } from "@/components/teacher/teacher-form-page"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"

export default function NewTeacherPage() {
  const router = useRouter()
  const { data: session, isLoading: sessionLoading } = useSession()
  const createMutation = useCreateTeacher()

  const isSuperAdmin = session?.roles.includes("super_admin") ?? false

  React.useEffect(() => {
    if (!sessionLoading && session?.signedIn && !isSuperAdmin) {
      router.replace("/students")
    }
  }, [session, sessionLoading, isSuperAdmin, router])

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <HugeiconsIcon
          icon={Alert02Icon}
          strokeWidth={1.5}
          className="size-12 text-muted-foreground"
        />
        <p className="text-base font-medium">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          Only administrators can create teacher accounts.
        </p>
      </div>
    )
  }

  return (
    <TeacherFormPage
      onSubmit={async (data) => {
        try {
          await createMutation.mutateAsync(data)
          return true
        } catch {
          return false
        }
      }}
    />
  )
}
