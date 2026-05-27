export interface Student {
  id: string
  name: string
  imageUrl: string | null
  indexNumber: string
  address: string
  birthDay: string
  currentGrade: string
  specialRemarks: string | null
  contactNo: string
  guardianName: string | null
  siblingsAtSchool: string | null
  createdAt: string
}

export type StudentFormData = Omit<
  Student,
  "id" | "createdAt" | "imageUrl"
> & {
  imageUrl?: string
}

export interface ApiResponse<T> {
  success?: boolean
  error?: string
  data?: T
}
