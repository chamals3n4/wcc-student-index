"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useStudentsQuery, useDeleteStudent } from "@/hooks/use-students"
import { StudentsTable } from "@/components/students-table"
import { DeleteDialog } from "@/components/delete-dialog"
import type { Student } from "@/lib/types"

export default function StudentsPage() {
  const router = useRouter()
  const { data: students = [], isLoading } = useStudentsQuery()
  const deleteMutation = useDeleteStudent()
  const [deleteTarget, setDeleteTarget] = React.useState<Student | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        All Students
      </h1>

      <StudentsTable
        students={students}
        loading={isLoading}
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
