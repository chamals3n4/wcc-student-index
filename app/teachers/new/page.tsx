"use client"

import { useCreateTeacher } from "@/hooks/use-students"
import { TeacherFormPage } from "@/components/teacher/teacher-form-page"

export default function NewTeacherPage() {
  const createMutation = useCreateTeacher()

  return (
    <TeacherFormPage
      onSubmit={async (data) => {
        try {
          await createMutation.mutateAsync(data)
          return true
        } catch (error) {
          return false
        }
      }}
    />
  )
}
