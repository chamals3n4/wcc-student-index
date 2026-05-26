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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ViewIcon,
  PencilEdit01Icon,
  Delete01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  StudentIcon,
  FilterIcon,
} from "@hugeicons/core-free-icons"
import type { Student } from "@/lib/types"
import Link from "next/link"

interface StudentsTableProps {
  students: Student[]
  loading: boolean
  onAdd: () => void
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}

const PAGE_SIZES = [5, 10, 20, 50] as const

export function StudentsTable({
  students,
  loading,
  onAdd: _onAdd,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  const [search, setSearch] = React.useState("")
  const [gradeFilter, setGradeFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<keyof Student>("createdAt")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const grades = React.useMemo(() => {
    const set = new Set(students.map((s) => s.currentGrade))
    return Array.from(set).sort()
  }, [students])

  const filtered = React.useMemo(() => {
    let result = [...students]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.indexNumber.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      )
    }

    if (gradeFilter !== "all") {
      result = result.filter((s) => s.currentGrade === gradeFilter)
    }

    result.sort((a, b) => {
      const aVal = a[sortField] ?? ""
      const bVal = b[sortField] ?? ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [students, search, gradeFilter, sortField, sortDir])

  React.useEffect(() => {
    setPage(1)
  }, [search, gradeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const startItem = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, filtered.length)

  const toggleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: keyof Student }) => {
    if (sortField !== field) return null
    return (
      <HugeiconsIcon
        icon={sortDir === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
        strokeWidth={2}
        className="ml-1 inline size-3.5"
      />
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(6)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
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
      {/* Toolbar - just search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, index, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 text-sm"
          />
        </div>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="h-10 w-40 text-sm">
            <HugeiconsIcon
              icon={FilterIcon}
              strokeWidth={2}
              className="size-4 text-muted-foreground"
            />
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-sm">#</TableHead>
              <TableHead
                className="cursor-pointer text-sm font-medium select-none"
                onClick={() => toggleSort("name")}
              >
                Student <SortIcon field="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-sm font-medium select-none"
                onClick={() => toggleSort("indexNumber")}
              >
                Index No. <SortIcon field="indexNumber" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-sm font-medium select-none"
                onClick={() => toggleSort("currentGrade")}
              >
                Grade <SortIcon field="currentGrade" />
              </TableHead>
              <TableHead className="text-sm font-medium">Contact</TableHead>
              <TableHead className="w-56 text-right text-sm font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <HugeiconsIcon
                      icon={StudentIcon}
                      strokeWidth={1.5}
                      className="size-12"
                    />
                    <p className="text-base font-medium">No students found</p>
                    <p className="text-sm">
                      {search || gradeFilter !== "all"
                        ? "Try adjusting your filters."
                        : "Add your first student using the button above."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {startItem + paginated.indexOf(student)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="default" className="size-9">
                        {student.imageUrl ? (
                          <img
                            src={student.imageUrl}
                            alt={student.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <p className="text-sm font-medium">{student.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.indexNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {student.currentGrade}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.parentContact}
                    {student.guardianContact && (
                      <span className="text-muted-foreground">
                        {" "}
                        / {student.guardianContact}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/students/${student.indexNumber}`}>
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-8 gap-1.5 border-border text-xs shadow-none"
                        >
                          <HugeiconsIcon
                            icon={ViewIcon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        size="xs"
                        onClick={() => onEdit(student)}
                        className="h-8 gap-1.5 bg-primary text-xs text-primary-foreground shadow-none hover:bg-primary/90"
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => onDelete(student)}
                        className="h-8 gap-1.5 bg-red-500 text-xs text-white shadow-none hover:bg-red-600"
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}–{endItem} of {filtered.length} student
            {filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v))
                setPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-[4.25rem] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">per page</span>

            <div className="ml-2 flex items-center gap-0.5">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="h-8 w-8"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  strokeWidth={2}
                  className="size-3"
                />
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  strokeWidth={2}
                  className="-ml-1 size-3"
                />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  strokeWidth={2}
                  className="size-3.5"
                />
              </Button>

              <span className="min-w-[3.5rem] text-center text-sm tabular-nums">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-3.5"
                />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="h-8 w-8"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-3"
                />
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="-ml-1 size-3"
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
