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
import type { StudentFormData, Class } from "@/lib/types"
import { useClassesQuery } from "@/hooks/use-students"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  SaveIcon,
  ImageUploadIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

interface StudentWithClass {
  name: string
  imageUrl?: string | null
  indexNumber: string
  address: string
  birthDay: string
  specialRemarks?: string | null
  contactNo: string
  guardianName?: string | null
  siblingsAtSchool?: string | null
  classId: string | null
  houseName?: "Vijaya" | "Gamunu" | "Parakum" | "Thissa" | null
}

interface StudentFormPageProps {
  student?: StudentWithClass | null
  onSubmit: (data: StudentFormData) => Promise<boolean>
  title: string
  description?: string
}

const INITIAL_FORM: StudentFormData = {
  name: "",
  indexNumber: "",
  address: "",
  birthDay: "",
  classId: "",
  specialRemarks: "",
  contactNo: "",
  guardianName: "",
  siblingsAtSchool: "",
}

const HOUSES = ["Vijaya", "Gamunu", "Parakum", "Thissa"] as const

function classLabel(c: Class): string {
  const base = `Grade ${c.grade} - ${c.section}`
  return c.stream ? `${base} (${c.stream})` : base
}

export function StudentFormPage({
  student,
  onSubmit,
  title,
}: StudentFormPageProps) {
  const router = useRouter()
  const { data: classOptions = [], isLoading: classesLoading } =
    useClassesQuery()

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
        classId: student.classId ?? "",
        specialRemarks: student.specialRemarks ?? "",
        contactNo: student.contactNo,
        guardianName: student.guardianName ?? "",
        siblingsAtSchool: student.siblingsAtSchool ?? "",
        imageUrl: student.imageUrl ?? undefined,
        houseName: student.houseName ?? undefined,
      })
      if (student.imageUrl) {
        setImagePreview(student.imageUrl)
      }
    }
  }, [student])

  // Auto-select when teacher has exactly one class assigned
  React.useEffect(() => {
    if (classOptions.length === 1 && !form.classId) {
      setForm((prev) => ({ ...prev, classId: classOptions[0].id }))
    }
  }, [classOptions])

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

  const handleSelectChange = (field: string, value: string | null) => {
    if (value === null) return
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm((prev) => ({ ...prev, imageUrl: undefined }))
    if (fileInputRef.current) fileInputRef.current.value = ""
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
    if (!form.classId) errs.classId = "Class is required"
    if (!form.contactNo.trim()) errs.contactNo = "Contact number is required"
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
    if (success) router.push("/students")
  }

  const isBusy = submitting || uploading
  const isClassLocked = classOptions.length === 1
  const isEditing = !!student

  // Compute selected class label explicitly to avoid UUID showing
  const selectedClassLabel = React.useMemo(() => {
    if (!form.classId) return null
    const c = classOptions.find((c) => c.id === form.classId)
    return c ? classLabel(c) : null
  }, [form.classId, classOptions])

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <Card className="py-5">
        <CardContent className="px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo + Name row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
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
                    size="sm"
                    onClick={handleRemoveImage}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. K.A.V.U. Kuruppu"
                  className="h-10"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Main fields grid */}
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
                  placeholder="e.g. 15707"
                  className="h-10"
                />
                {errors.indexNumber && (
                  <p className="text-xs text-destructive">
                    {errors.indexNumber}
                  </p>
                )}
              </div>

              {/* Class selector */}
              <div className="space-y-1.5">
                <Label htmlFor="classId" className="text-sm">
                  Class <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.classId}
                  onValueChange={(value) =>
                    handleSelectChange("classId", value)
                  }
                  disabled={classesLoading || isClassLocked}
                >
                  <SelectTrigger id="classId" className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        classesLoading ? "Loading classes..." : "Select class"
                      }
                    >
                      {selectedClassLabel ?? undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.length === 0 && !classesLoading && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No classes found. Ask an admin to create classes first.
                      </div>
                    )}
                    {classOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {classLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isClassLocked && (
                  <p className="text-xs text-muted-foreground">
                    You are assigned to this class only
                  </p>
                )}
                {errors.classId && (
                  <p className="text-xs text-destructive">{errors.classId}</p>
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
                <Label htmlFor="contactNo" className="text-sm">
                  Contact No <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactNo"
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                  className="h-10"
                />
                {errors.contactNo && (
                  <p className="text-xs text-destructive">{errors.contactNo}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guardianName" className="text-sm">
                  Guardian&apos;s Name
                </Label>
                <Input
                  id="guardianName"
                  name="guardianName"
                  value={form.guardianName ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. K.P. Budhdhima"
                  className="h-10"
                />
              </div>

              {isEditing && (
                <div className="space-y-1.5">
                  <Label htmlFor="houseName" className="text-sm">
                    House
                  </Label>
                  <Select
                    value={form.houseName ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("houseName", value)
                    }
                  >
                    <SelectTrigger id="houseName" className="h-10 w-full">
                      <SelectValue placeholder="Select house" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUSES.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Auto-assigned from index number. Change if needed.
                  </p>
                </div>
              )}
            </div>

            {/* Textareas */}
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
                <Label htmlFor="siblingsAtSchool" className="text-sm">
                  Siblings at School
                </Label>
                <Textarea
                  id="siblingsAtSchool"
                  name="siblingsAtSchool"
                  value={form.siblingsAtSchool ?? ""}
                  onChange={handleChange}
                  placeholder="Names of siblings attending the same school"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="specialRemarks" className="text-sm">
                  Special Remarks
                </Label>
                <Textarea
                  id="specialRemarks"
                  name="specialRemarks"
                  value={form.specialRemarks ?? ""}
                  onChange={handleChange}
                  placeholder="Any special notes, prefect status, medical conditions..."
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/students")}
                disabled={isBusy}
                className="w-full sm:w-auto"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isBusy}
                className="w-full gap-2 sm:w-auto"
              >
                {isBusy ? (
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
