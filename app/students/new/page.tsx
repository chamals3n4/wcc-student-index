"use client"

import { useCreateStudent } from "@/hooks/use-students"
import { StudentFormPage } from "@/components/student-form-page"

export default function NewStudentPage() {
  const createMutation = useCreateStudent()

  return (
    <StudentFormPage
      onSubmit={async (data) => {
        await createMutation.mutateAsync(data)
        return true
      }}
      title="Add New Student"
      description="Register a new student into the Wellawa Central College database."
    />
  )
}
