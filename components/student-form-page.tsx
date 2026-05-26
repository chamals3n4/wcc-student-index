"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Student, StudentFormData } from "@/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  SaveIcon,
  ImageUploadIcon,
} from "@hugeicons/core-free-icons"

interface StudentFormPageProps {
  student?: Student | null
  onSubmit: (data: StudentFormData) => Promise<boolean>
  title: string
  description: string
}

const GRADE_OPTIONS = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Grade 13",
] as const

const INITIAL_FORM: StudentFormData = {
  name: "",
  indexNumber: "",
  address: "",
  birthDay: "",
  currentGrade: "",
  specialRemarks: "",
  parentContact: "",
  guardianContact: "",
}

export function StudentFormPage({
  student,
  onSubmit,
  title,
}: StudentFormPageProps) {
  const router = useRouter()
  const [form, setForm] = React.useState<StudentFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        indexNumber: student.indexNumber,
        address: student.address,
        birthDay: student.birthDay,
        currentGrade: student.currentGrade,
        specialRemarks: student.specialRemarks ?? "",
        parentContact: student.parentContact,
        guardianContact: student.guardianContact ?? "",
        imageUrl: student.imageUrl ?? undefined,
      })
      if (student.imageUrl) {
        setImagePreview(student.imageUrl)
      }
    }
  }, [student])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm((prev) => ({ ...prev, imageUrl: undefined }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return form.imageUrl
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", imageFile)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.imageUrl) return data.imageUrl
    } catch {
      // continue without image
    } finally {
      setUploading(false)
    }
    return undefined
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.indexNumber.trim()) errs.indexNumber = "Index number is required"
    if (!form.address.trim()) errs.address = "Address is required"
    if (!form.birthDay) errs.birthDay = "Date of birth is required"
    if (!form.currentGrade) errs.currentGrade = "Grade is required"
    if (!form.parentContact.trim())
      errs.parentContact = "Parent contact is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const imageUrl = await uploadImage()
    const dataToSubmit = { ...form }
    if (imageUrl) dataToSubmit.imageUrl = imageUrl

    const success = await onSubmit(dataToSubmit)
    setSubmitting(false)
    if (success) {
      router.push("/students")
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <Card className="py-5">
        <CardContent className="px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload + Name */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Upload area */}
              <div className="flex shrink-0 flex-col items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="photo-upload"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex size-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={ImageUploadIcon}
                        strokeWidth={1.5}
                        className="size-7 text-muted-foreground group-hover:text-primary"
                      />
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary">
                        Upload Photo
                      </span>
                    </>
                  )}
                </div>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleRemoveImage}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    Remove Photo
                  </Button>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="h-10"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
            </div>

            {/* 3-column grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="indexNumber" className="text-sm">
                  Index Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="indexNumber"
                  name="indexNumber"
                  value={form.indexNumber}
                  onChange={handleChange}
                  placeholder="e.g. WCC/2024/001"
                  className="h-10"
                />
                {errors.indexNumber && (
                  <p className="text-xs text-destructive">
                    {errors.indexNumber}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currentGrade" className="text-sm">
                  Grade <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.currentGrade}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, currentGrade: value }))
                    if (errors.currentGrade) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.currentGrade
                        return next
                      })
                    }
                  }}
                >
                  <SelectTrigger id="currentGrade" className="h-10 w-full">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currentGrade && (
                  <p className="text-xs text-destructive">
                    {errors.currentGrade}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDay" className="text-sm">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthDay"
                  name="birthDay"
                  type="date"
                  value={form.birthDay}
                  onChange={handleChange}
                  className="h-10"
                />
                {errors.birthDay && (
                  <p className="text-xs text-destructive">{errors.birthDay}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parentContact" className="text-sm">
                  Parent Contact <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parentContact"
                  name="parentContact"
                  value={form.parentContact}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                  className="h-10"
                />
                {errors.parentContact && (
                  <p className="text-xs text-destructive">
                    {errors.parentContact}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guardianContact" className="text-sm">
                  Guardian Contact
                </Label>
                <Input
                  id="guardianContact"
                  name="guardianContact"
                  value={form.guardianContact ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 0777654321"
                  className="h-10"
                />
              </div>
            </div>

            {/* Address + Remarks side by side */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full residential address"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialRemarks" className="text-sm">
                  Special Remarks
                </Label>
                <Textarea
                  id="specialRemarks"
                  name="specialRemarks"
                  value={form.specialRemarks ?? ""}
                  onChange={handleChange}
                  placeholder="Any special notes, medical conditions, or important information..."
                  rows={3}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/students")}
                disabled={submitting || uploading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="w-full gap-2 sm:w-auto"
              >
                {submitting || uploading ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    strokeWidth={2}
                    className="size-4 animate-spin"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={SaveIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                {student ? "Save Changes" : "Add Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
