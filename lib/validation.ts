import { z } from "zod"

export const studentSchema = z.object({
  name: z.string(),

  imageUrl: z.string().optional(),

  indexNumber: z.string(),

  address: z.string(),

  birthDay: z.string(),

  currentGrade: z.string(),

  specialRemarks: z.string().optional(),

  contactNo: z.string(),

  guardianName: z.string().optional(),

  siblingsAtSchool: z.string().optional(),
})
