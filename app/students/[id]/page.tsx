"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useStudentQuery, useDeleteStudent } from "@/hooks/use-students"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Calendar01Icon,
  Location01Icon,
  Note02Icon,
  UserIcon,
  FingerPrintIcon,
  SchoolIcon,
  Call02Icon,
} from "@hugeicons/core-free-icons"
import { format } from "date-fns"
import Link from "next/link"

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const indexNumber = params.id as string
  const { data: student, isLoading } = useStudentQuery(indexNumber)
  const deleteMutation = useDeleteStudent()
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const initials = React.useMemo(() => {
    if (!student) return ""
    return student.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [student])

  const formattedBirthDay = React.useMemo(() => {
    if (!student?.birthDay) return ""
    try {
      return format(new Date(student.birthDay), "MMMM d, yyyy")
    } catch {
      return student.birthDay
    }
  }, [student])

  const formattedCreatedAt = React.useMemo(() => {
    if (!student?.createdAt) return ""
    try {
      return format(new Date(student.createdAt), "PPpp")
    } catch {
      return student.createdAt
    }
  }, [student])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-32" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 pt-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-lg font-medium">Student not found</p>
        <Button variant="outline" onClick={() => router.push("/students")}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          Back to Students
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Link href={`/students/${indexNumber}/edit`}>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} /> Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="size-32 overflow-hidden rounded-full ring-4 ring-primary/50">
              {student.imageUrl ? (
                <img
                  src={student.imageUrl}
                  alt={student.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary/10">
                  <span className="text-3xl font-semibold text-primary">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="font-heading text-xl font-semibold">
                {student.name}
              </h2>
              <Badge variant="secondary" className="mt-1">
                {student.currentGrade}
              </Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              {student.indexNumber}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: UserIcon, label: "Full Name", value: student.name },
                {
                  icon: FingerPrintIcon,
                  label: "Index Number",
                  value: student.indexNumber,
                  mono: true,
                },
                {
                  icon: Calendar01Icon,
                  label: "Date of Birth",
                  value: formattedBirthDay,
                },
                {
                  icon: SchoolIcon,
                  label: "Grade",
                  value: student.currentGrade,
                  badge: true,
                },
                {
                  icon: Call02Icon,
                  label: "Parent Contact",
                  value: student.parentContact,
                  mono: true,
                },
                {
                  icon: Call02Icon,
                  label: "Guardian Contact",
                  value: student.guardianContact || "—",
                  mono: true,
                },
              ].map(({ icon, label, value, mono, badge: isBadge }) => (
                <div key={label} className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={icon}
                    strokeWidth={2}
                    className="mt-0.5 size-4 text-muted-foreground"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {isBadge ? (
                      <Badge variant="secondary">{value}</Badge>
                    ) : (
                      <p
                        className={`text-sm font-medium ${mono ? "font-mono" : ""}`}
                      >
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />
            <div className="flex items-start gap-3">
              <HugeiconsIcon
                icon={Location01Icon}
                strokeWidth={2}
                className="mt-0.5 size-4 text-muted-foreground"
              />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm">{student.address}</p>
              </div>
            </div>

            {student.specialRemarks && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={Note02Icon}
                    strokeWidth={2}
                    className="mt-0.5 size-4 text-muted-foreground"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Special Remarks
                    </p>
                    <p className="text-sm">{student.specialRemarks}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-start gap-3">
              <HugeiconsIcon
                icon={Calendar01Icon}
                strokeWidth={2}
                className="mt-0.5 size-4 text-muted-foreground"
              />
              <div>
                <p className="text-xs text-muted-foreground">Record Created</p>
                <p className="text-sm text-muted-foreground">
                  {formattedCreatedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        student={student}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(indexNumber)
          router.push("/students")
          return true
        }}
      />
    </div>
  )
}
