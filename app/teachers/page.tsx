"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTeachersQuery, useDeleteTeacher } from "@/hooks/use-students"
import { useSession } from "@/hooks/use-session"
import { TeachersTable } from "@/components/teacher/teachers-table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Alert02Icon } from "@hugeicons/core-free-icons"
import type { Teacher } from "@/lib/types"

export default function TeachersPage() {
  const router = useRouter()
  const { data: session, isLoading: sessionLoading } = useSession()
  const { data: teachers = [], isLoading } = useTeachersQuery()
  const deleteMutation = useDeleteTeacher()
  const [deleteTarget, setDeleteTarget] = React.useState<Teacher | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const isSuperAdmin = session?.roles.includes("super_admin") ?? false

  // Redirect non-super-admins away
  React.useEffect(() => {
    if (!sessionLoading && session?.signedIn && !isSuperAdmin) {
      router.replace("/students")
    }
  }, [session, sessionLoading, isSuperAdmin, router])

  if (sessionLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
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
          Only administrators can manage teachers.
        </p>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Teachers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage teacher accounts — creates Asgardeo identities automatically
          </p>
        </div>
        <Button onClick={() => router.push("/teachers/new")} size="sm">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Add Teacher
        </Button>
      </div>

      <TeachersTable
        teachers={teachers}
        loading={isLoading}
        onAdd={() => router.push("/teachers/new")}
        onDelete={setDeleteTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete Teacher
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
