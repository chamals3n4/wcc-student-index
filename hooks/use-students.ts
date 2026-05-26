import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Student, StudentFormData } from "@/lib/types"

const BASE_URL = "/api/students"

async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

async function fetchStudent(indexNumber: string): Promise<Student> {
  const res = await fetch(`${BASE_URL}/${indexNumber}`)
  if (!res.ok) throw new Error("Failed to fetch")
  const data = await res.json()
  return data[0]
}

async function createStudent(data: StudentFormData) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create")
  return res.json()
}

async function updateStudent(indexNumber: string, data: StudentFormData) {
  const res = await fetch(`${BASE_URL}/${indexNumber}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update")
  return res.json()
}

async function deleteStudent(indexNumber: string) {
  const res = await fetch(`${BASE_URL}/${indexNumber}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete")
  return res.json()
}

export function useStudentsQuery() {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  })
}

export function useStudentQuery(indexNumber: string) {
  return useQuery({
    queryKey: ["students", indexNumber],
    queryFn: () => fetchStudent(indexNumber),
    enabled: !!indexNumber,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Student added successfully")
    },
    onError: () => {
      toast.error("Failed to add student")
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      indexNumber,
      data,
    }: {
      indexNumber: string
      data: StudentFormData
    }) => updateStudent(indexNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Student updated successfully")
    },
    onError: () => {
      toast.error("Failed to update student")
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Student deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete student")
    },
  })
}
