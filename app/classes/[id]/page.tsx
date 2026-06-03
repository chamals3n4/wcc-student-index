"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useClassesQuery,
  useClassTeachersQuery,
  useTeachersQuery,
  useAssignTeacher,
  useUnassignTeacher,
} from "@/hooks/use-students"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  UserIcon,
  Mail01Icon,
  SchoolIcon,
  Delete01Icon,
  Add01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { useSession } from "@/hooks/use-session"

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: session, isLoading: sessionLoading } = useSession()

  const { data: allClasses = [], isLoading: classLoading } = useClassesQuery()
  const { data: assignments = [], isLoading: assignLoading } =
    useClassTeachersQuery(id)
  const { data: allTeachers = [] } = useTeachersQuery()
  const assignTeacher = useAssignTeacher()
  const unassignTeacher = useUnassignTeacher()

  const [selectedTeacherId, setSelectedTeacherId] = React.useState("")

  const cls = allClasses.find((c) => c.id === id)

  const assignedTeacherIds = new Set(assignments.map((a: any) => a.teacherId))
  const availableTeachers = allTeachers.filter(
    (t) => !assignedTeacherIds.has(t.id)
  )

  const handleAssign = async () => {
    if (!selectedTeacherId) return
    await assignTeacher.mutateAsync({
      classId: id,
      teacherId: selectedTeacherId,
    })
    setSelectedTeacherId("")
  }

  const isSuperAdmin = session?.roles.includes("super_admin") ?? false

  if (sessionLoading || classLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <HugeiconsIcon
          icon={Alert02Icon}
          strokeWidth={1.5}
          className="size-12 text-muted-foreground"
        />
        <p className="text-base font-medium">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          Only administrators can manage class assignments.
        </p>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-lg font-medium">Class not found</p>
        <Button variant="outline" onClick={() => router.push("/classes")}>
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          Back to Classes
        </Button>
      </div>
    )
  }

  const classTitle = cls.stream
    ? `Grade ${cls.grade} - ${cls.section} (${cls.stream})`
    : `Grade ${cls.grade} - ${cls.section}`

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={() => router.back()} className="gap-2">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="size-4"
            />
            Back
          </Button>
        </div>

        {/* Class Info Header */}
        <div className="flex flex-1 items-center gap-4 sm:justify-end">
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon
              icon={SchoolIcon}
              strokeWidth={1.5}
              className="size-7 text-primary"
            />
          </div>
          <div className="flex-1 sm:text-right">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {classTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              Academic Year {cls.academicYear}
            </p>
          </div>
        </div>
      </div>

      {/* Assigned Teachers Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={UserIcon}
              strokeWidth={2}
              className="size-5 text-primary"
            />
            <CardTitle className="font-heading text-lg">
              Assigned Teachers
            </CardTitle>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 p-4">
          {assignLoading ? (
            <Skeleton className="h-16 rounded-lg" />
          ) : assignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted py-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No teachers assigned yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a teacher below to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {a.teacherName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {a.teacherName}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <HugeiconsIcon
                          icon={Mail01Icon}
                          strokeWidth={2}
                          className="size-3 shrink-0"
                        />
                        <span className="truncate">{a.teacherEmail}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => unassignTeacher.mutate(a.id)}
                    className="ml-2 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    title="Remove teacher"
                  >
                    <HugeiconsIcon
                      icon={Delete01Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Assign New Teacher */}
          <Separator className="my-3" />
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-end">
            <Select
              value={selectedTeacherId}
              onValueChange={(v) => {
                if (v !== null) setSelectedTeacherId(v)
              }}
            >
              <SelectTrigger className="h-9 flex-1">
                <SelectValue
                  placeholder={
                    availableTeachers.length === 0
                      ? "All teachers assigned"
                      : "Select a teacher..."
                  }
                >
                  {/* Explicit display label so it never shows UUID */}
                  {selectedTeacherId
                    ? (() => {
                        const t = availableTeachers.find(
                          (t) => t.id === selectedTeacherId
                        )
                        return t
                          ? `${t.name} — ${t.email}`
                          : "Select a teacher..."
                      })()
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableTeachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.email}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={!selectedTeacherId || assignTeacher.isPending}
              className="shrink-0 gap-2"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="size-4"
              />
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg">Class Details</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Grade
              </p>
              <p className="text-lg font-semibold">{cls.grade}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Section
              </p>
              <p className="text-lg font-semibold">{cls.section}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Stream
              </p>
              <p className="text-lg font-semibold">{cls.stream ?? "—"}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Teachers
              </p>
              <Badge variant="secondary" className="text-base font-semibold">
                {assignments.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
