import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Student, StudentFormData, Class, Teacher } from "@/lib/types"

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

async function fetchClasses(year?: string): Promise<Class[]> {
  const url = year ? `/api/classes?year=${year}` : "/api/classes"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch classes")
  return res.json()
}

async function createClasses(payload: Partial<Class> | Partial<Class>[]) {
  const res = await fetch("/api/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create")
  return res.json()
}

async function deleteClass(id: string) {
  const res = await fetch("/api/classes", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error("Failed to delete")
  return res.json()
}

export function useClassesQuery(year?: string) {
  return useQuery({
    queryKey: ["classes", year],
    queryFn: () => fetchClasses(year),
  })
}

export function useCreateClasses() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createClasses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] })
      toast.success("Classes created successfully")
    },
    onError: () => {
      toast.error("Failed to create classes")
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] })
      toast.success("Class removed")
    },
    onError: () => {
      toast.error("Failed to remove class")
    },
  })
}

async function fetchTeachers(): Promise<Teacher[]> {
  const res = await fetch("/api/teachers")
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

async function createTeacher(data: {
  firstName: string
  lastName: string
  email: string
  mode: "set_password" | "invite"
  password?: string
}) {
  const res = await fetch("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? "Failed to create teacher")
  }
  return res.json()
}

async function deleteTeacher(id: string) {
  const res = await fetch("/api/teachers", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error("Failed to delete")
  return res.json()
}

async function fetchClassTeachers(classId: string) {
  const res = await fetch(`/api/class-teachers?classId=${classId}`)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

async function fetchTeacherClasses(teacherId: string) {
  const res = await fetch(`/api/class-teachers?teacherId=${teacherId}`)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

async function assignTeacher(data: { classId: string; teacherId: string }) {
  const res = await fetch("/api/class-teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to assign")
  return res.json()
}

async function unassignTeacher(id: string) {
  const res = await fetch("/api/class-teachers", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error("Failed to unassign")
  return res.json()
}

export function useTeachersQuery() {
  return useQuery({ queryKey: ["teachers"], queryFn: fetchTeachers })
}

export function useCreateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] })
      toast.success("Teacher added and Asgardeo account created")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] })
      toast.success("Teacher removed")
    },
    onError: () => toast.error("Failed to remove teacher"),
  })
}

export function useClassTeachersQuery(classId: string) {
  return useQuery({
    queryKey: ["class-teachers", classId],
    queryFn: () => fetchClassTeachers(classId),
    enabled: !!classId,
  })
}

export function useTeacherClassesQuery(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-classes", teacherId],
    queryFn: () => fetchTeacherClasses(teacherId),
    enabled: !!teacherId,
  })
}

export function useAssignTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-teachers"] })
      toast.success("Teacher assigned")
    },
    onError: () => toast.error("Failed to assign teacher"),
  })
}

export function useUnassignTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unassignTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-teachers"] })
      toast.success("Teacher unassigned")
    },
    onError: () => toast.error("Failed to unassign teacher"),
  })
}
