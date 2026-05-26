import { z } from "zod"

export const studentSchema = z.object({
  name: z.string(),

  imageUrl: z.string().optional(),

  indexNumber: z.string(),

  address: z.string(),

  birthDay: z.string(),

  currentGrade: z.string(),

  specialRemarks: z.string().optional(),

  parentContact: z.string(),

  guardianContact: z.string().optional(),
})
