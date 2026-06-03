"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useStudentsQuery, useDeleteStudent } from "@/hooks/use-students"
import { useSession } from "@/hooks/use-session"
import { StatsCards } from "@/components/overview/stats-cards"
import { StudentsTable } from "@/components/student/students-table"
import { DeleteDialog } from "@/components/delete-dialog"
import type { EnrichedStudent } from "@/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: students = [], isLoading } = useStudentsQuery()
  const deleteMutation = useDeleteStudent()
  const [deleteTarget, setDeleteTarget] =
    React.useState<EnrichedStudent | null>(null)

  // Redirect teachers to /students — they don't need the dashboard
  React.useEffect(() => {
    if (session?.roles.includes("teacher")) {
      router.replace("/students")
    }
  }, [session, router])

  const uniqueGrades = React.useMemo(() => {
    const nums = students
      .map((s) => s.grade)
      .filter((g): g is number => g != null)
    return new Set(nums).size
  }, [students])

  const today = React.useMemo(() => {
    const now = new Date().toISOString().split("T")[0]
    return students.filter((s) => s.createdAt?.startsWith(now)).length
  }, [students])

  const recentStudents = React.useMemo(() => {
    return [...students]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
  }, [students])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Dashboard
      </h1>

      <StatsCards
        totalStudents={students.length}
        totalGrades={uniqueGrades}
        totalToday={today}
        loading={isLoading}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">
            Recent Students
          </h2>
          <Link href="/students">
            <Button variant="ghost" size="sm">
              View All
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
          </Link>
        </div>

        <StudentsTable
          students={recentStudents}
          loading={isLoading}
          onAdd={() => router.push("/students/new")}
          onEdit={(s) => router.push(`/students/${s.indexNumber}/edit`)}
          onDelete={setDeleteTarget}
        />
      </div>

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
