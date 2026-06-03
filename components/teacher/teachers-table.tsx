"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Delete01Icon,
  Mail01Icon,
  SchoolIcon,
  UserGroup03Icon,
} from "@hugeicons/core-free-icons"
import type { Teacher } from "@/lib/types"
import { useTeacherClassesQuery } from "@/hooks/use-students"

interface TeachersTableProps {
  teachers: Teacher[]
  loading: boolean
  onAdd: () => void
  onDelete: (teacher: Teacher) => void
}

export function TeachersTable({
  teachers,
  loading,
  onAdd: _onAdd,
  onDelete,
}: TeachersTableProps) {
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!search) return teachers
    const q = search.toLowerCase()
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
    )
  }, [teachers, search])

  const getTeacherInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const getAsgardeoStatus = (teacher: Teacher) => {
    const isLinked = teacher.asgardeoUserId !== "pending"
    return {
      isLinked,
      label: isLinked ? "Linked" : "Pending",
      badgeClass: isLinked
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dotClass: isLinked ? "bg-emerald-500" : "bg-amber-500",
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 w-64">
          <Skeleton className="h-full" />
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(5)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative w-full sm:max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-9 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-sm font-medium">Teacher</TableHead>
              <TableHead className="text-sm font-medium">Email</TableHead>
              <TableHead className="text-sm font-medium">Classes</TableHead>
              <TableHead className="text-sm font-medium">Asgardeo</TableHead>
              <TableHead className="w-20 text-right text-sm font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <HugeiconsIcon
                      icon={UserGroup03Icon}
                      strokeWidth={1.5}
                      className="size-12"
                    />
                    <p className="text-base font-medium">No teachers found</p>
                    <p className="text-sm">
                      {search
                        ? "Try adjusting your search."
                        : "Add your first teacher using the button above."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((teacher) => (
                <TeacherTableRow
                  key={teacher.id}
                  teacher={teacher}
                  getInitials={getTeacherInitials}
                  getAsgardeoStatus={getAsgardeoStatus}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Separate component to handle individual row with class assignments
function TeacherTableRow({
  teacher,
  getInitials,
  getAsgardeoStatus,
  onDelete,
}: {
  teacher: Teacher
  getInitials: (name: string) => string
  getAsgardeoStatus: (t: Teacher) => {
    isLinked: boolean
    label: string
    badgeClass: string
    dotClass: string
  }
  onDelete: (teacher: Teacher) => void
}) {
  const { data: assignments = [] } = useTeacherClassesQuery(teacher.id)
  const status = getAsgardeoStatus(teacher)

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar size="default" className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(teacher.name)}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{teacher.name}</p>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {teacher.email}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {assignments.length === 0 ? (
            <span className="text-xs text-muted-foreground/60">No classes</span>
          ) : (
            assignments.slice(0, 2).map((a: any) => (
              <Badge key={a.id} variant="secondary" className="text-xs">
                <HugeiconsIcon
                  icon={SchoolIcon}
                  strokeWidth={2}
                  className="mr-1 size-3"
                />
                Grade {a.grade}-{a.section}
              </Badge>
            ))
          )}
          {assignments.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{assignments.length - 2} more
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badgeClass}`}
        >
          <span className={`size-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(teacher)}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          title="Delete teacher"
        >
          <HugeiconsIcon
            icon={Delete01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </TableCell>
    </TableRow>
  )
}
