import { z } from "zod"
import { HOUSES } from "./house"

export const studentSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  indexNumber: z.string().min(1),
  address: z.string().min(1),
  birthDay: z.string().min(1),
  specialRemarks: z.string().optional(),
  contactNo: z.string().min(1),
  guardianName: z.string().optional(),
  siblingsAtSchool: z.string().optional(),
  classId: z.string().uuid("Invalid class"),
  houseName: z.enum(HOUSES).optional(),
})

export const classSchema = z.object({
  academicYear: z.string().min(4),
  grade: z.number().int().min(1).max(13),
  section: z.string().min(1),
  stream: z.enum(["Maths", "Bio", "Commerce", "Art"]).nullable().optional(),
})

export const teacherSchema = z.object({
  asgardeoUserId: z.string().optional().default("pending"),
  name: z.string().min(1),
  email: z.string().email(),
})
