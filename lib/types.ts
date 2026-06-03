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

/** Student with joined enrollment + class fields from the API */
export interface EnrichedStudent extends Student {
  enrollmentId: string | null
  enrollmentStatus: "active" | "completed" | "transferred" | "left" | null
  enrolledAt: string | null
  classId: string | null
  academicYear: string | null
  grade: number | null
  section: string | null
  stream: "Maths" | "Bio" | "Commerce" | "Art" | null
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
