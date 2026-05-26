"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Student, StudentFormData } from "@/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

interface StudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: StudentFormData) => Promise<boolean>
  student?: Student | null
  title?: string
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

export function StudentForm({
  open,
  onOpenChange,
  onSubmit,
  student,
  title,
}: StudentFormProps) {
  const [form, setForm] = React.useState<StudentFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = React.useState(false)

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
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [student, open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGradeChange = (value: string | null) => {
    if (value === null) return
    setForm((prev) => ({ ...prev, currentGrade: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const success = await onSubmit(form)
    setSubmitting(false)
    if (success) {
      onOpenChange(false)
    }
  }

  const isEdit = !!student

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {title || (isEdit ? "Edit Student" : "Add New Student")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the student's information below."
              : "Fill in the student's details to add them to the database."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indexNumber">Index Number *</Label>
              <Input
                id="indexNumber"
                name="indexNumber"
                value={form.indexNumber}
                onChange={handleChange}
                placeholder="e.g. WCC/2024/001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDay">Date of Birth *</Label>
              <Input
                id="birthDay"
                name="birthDay"
                type="date"
                value={form.birthDay}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentGrade">Grade *</Label>
              <Select
                value={form.currentGrade}
                onValueChange={handleGradeChange}
                name="currentGrade"
              >
                <SelectTrigger id="currentGrade" className="w-full">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentContact">Parent Contact *</Label>
              <Input
                id="parentContact"
                name="parentContact"
                value={form.parentContact}
                onChange={handleChange}
                placeholder="e.g. 0771234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <Input
                id="guardianContact"
                name="guardianContact"
                value={form.guardianContact ?? ""}
                onChange={handleChange}
                placeholder="e.g. 0777654321"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Full address"
                rows={2}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="specialRemarks">Special Remarks</Label>
              <Textarea
                id="specialRemarks"
                name="specialRemarks"
                value={form.specialRemarks ?? ""}
                onChange={handleChange}
                placeholder="Any special notes about this student..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="animate-spin"
                />
              )}
              {isEdit ? "Save Changes" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
