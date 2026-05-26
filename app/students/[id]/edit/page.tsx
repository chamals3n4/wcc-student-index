"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useStudentQuery, useUpdateStudent } from "@/hooks/use-students"
import { StudentFormPage } from "@/components/student-form-page"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const indexNumber = params.id as string
  const { data: student, isLoading } = useStudentQuery(indexNumber)
  const updateMutation = useUpdateStudent()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-lg font-medium">Student not found</p>
        <Button variant="outline" onClick={() => router.push("/students")}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} /> Back to
          Students
        </Button>
      </div>
    )
  }

  return (
    <StudentFormPage
      student={student}
      onSubmit={async (data) => {
        await updateMutation.mutateAsync({ indexNumber, data })
        return true
      }}
      title="Edit Student"
      description="Update the student's information."
    />
  )
}
