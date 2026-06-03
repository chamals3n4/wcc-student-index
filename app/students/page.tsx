"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  useStudentsQuery,
  useDeleteStudent,
  useClassesQuery,
} from "@/hooks/use-students"
import { useSession } from "@/hooks/use-session"
import { StudentsTable } from "@/components/student/students-table"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { SchoolIcon } from "@hugeicons/core-free-icons"
import type { EnrichedStudent, Class } from "@/lib/types"

function classLabel(c: Class): string {
  const base = `Grade ${c.grade} - ${c.section}`
  return c.stream ? `${base} (${c.stream})` : base
}

export default function StudentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: students = [], isLoading } = useStudentsQuery()
  const { data: allClasses = [] } = useClassesQuery()
  const deleteMutation = useDeleteStudent()
  const [deleteTarget, setDeleteTarget] =
    React.useState<EnrichedStudent | null>(null)

  const isTeacher = session?.roles.includes("teacher") ?? false

  // Compute teacher's assigned class labels
  const assignedClasses = React.useMemo(() => {
    if (!isTeacher || !session) return []
    const ids = session.assignedClassIds ?? []
    return allClasses.filter((c) => ids.includes(c.id))
  }, [isTeacher, session, allClasses])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          All Students
        </h1>

        {/* Teacher: show assigned class context */}
        {isTeacher && (
          <div className="flex flex-wrap items-center gap-1.5">
            <HugeiconsIcon
              icon={SchoolIcon}
              strokeWidth={1.5}
              className="size-3.5 text-muted-foreground"
            />
            <span className="text-sm text-muted-foreground">Class:</span>
            {assignedClasses.length === 0 ? (
              <span className="text-sm text-muted-foreground italic">
                No class assigned
              </span>
            ) : (
              assignedClasses.map((c) => (
                <Badge key={c.id} variant="secondary" className="text-xs">
                  {classLabel(c)}
                </Badge>
              ))
            )}
          </div>
        )}
      </div>

      <StudentsTable
        students={students}
        loading={isLoading}
        showGradeFilter={!isTeacher}
        onAdd={() => router.push("/students/new")}
        onEdit={(s) => router.push(`/students/${s.indexNumber}/edit`)}
        onDelete={setDeleteTarget}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        student={deleteTarget}
        onConfirm={async () => {
          if (!deleteTarget) return false
          await deleteMutation.mutateAsync(deleteTarget.indexNumber)
          return true
        }}
      />
    </div>
  )
}
