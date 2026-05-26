"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Student } from "@/lib/types"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
  onConfirm: () => Promise<boolean>
}

export function DeleteDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
}: DeleteDialogProps) {
  if (!student) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            Delete Student
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{student.name}</span>{" "}
            (Index:{" "}
            <span className="font-mono text-foreground">
              {student.indexNumber}
            </span>
            )? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={async (e) => {
              e.preventDefault()
              const ok = await onConfirm()
              if (ok) onOpenChange(false)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
