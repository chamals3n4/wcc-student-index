export interface Student {
  id: string
  name: string
  imageUrl: string | null
  indexNumber: string
  address: string
  birthDay: string
  specialRemarks: string | null
  contactNo: string
  guardianName: string | null
  siblingsAtSchool: string | null
  createdAt: string
}

export interface Class {
  id: string
  academicYear: string
  grade: number
  section: string
  stream: "Maths" | "Bio" | "Commerce" | "Art" | null
  createdAt: string
}

export interface Enrollment {
  id: string
  studentId: string
  classId: string
  status: "active" | "completed" | "transferred" | "left"
  enrolledAt: string
}

export interface StudentWithClass extends Student {
  enrollment: Enrollment | null
  class: Class | null
}

export interface Teacher {
  id: string
  asgardeoUserId: string
  name: string
  email: string
  createdAt: string
}

export type StudentFormData = Omit<Student, "id" | "createdAt" | "imageUrl"> & {
  imageUrl?: string
  classId: string
}

export interface ApiResponse<T> {
  success?: boolean
  error?: string
  data?: T
}
