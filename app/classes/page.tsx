"use client"

import * as React from "react"
import {
  useClassesQuery,
  useCreateClasses,
  useDeleteClass,
} from "@/hooks/use-students"
import { ClassesGrid } from "@/components/classes-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Loading03Icon,
  GridIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import type { Class } from "@/lib/types"
import { toast } from "sonner"

// ── constants ────────────────────────────────────────────────────────────────

const STREAMS = ["Maths", "Bio", "Commerce", "Art"] as const
type Stream = (typeof STREAMS)[number]

const STANDARD_SECTIONS = ["A", "B", "C", "D", "E", "F"]

function generateYears(): string[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => String(current - 1 + i))
}

// ── year selector ─────────────────────────────────────────────────────────────

function useActiveYear() {
  const [year, setYearState] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("wcc_active_year") ??
        String(new Date().getFullYear())
      )
    }
    return String(new Date().getFullYear())
  })

  const setYear = (y: string) => {
    localStorage.setItem("wcc_active_year", y)
    setYearState(y)
  }

  return { year, setYear }
}

// ── bulk add dialog ───────────────────────────────────────────────────────────

interface BulkAddDialogProps {
  activeYear: string
  onDone: () => void
}

function BulkAddDialog({ activeYear, onDone }: BulkAddDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [grade, setGrade] = React.useState<string>("")
  const [selectedSections, setSelectedSections] = React.useState<string[]>([])
  const [stream, setStream] = React.useState<Stream | "">("")
  const [customSection, setCustomSection] = React.useState("")
  const createClasses = useCreateClasses()

  const isAL = grade === "12" || grade === "13"
  const sections = isAL
    ? stream
      ? [`${stream[0]}1`, `${stream[0]}2`, `${stream[0]}3`]
      : []
    : STANDARD_SECTIONS

  const toggleSection = (s: string) => {
    setSelectedSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const addCustomSection = () => {
    const s = customSection.trim().toUpperCase()
    if (s && !selectedSections.includes(s)) {
      setSelectedSections((prev) => [...prev, s])
      setCustomSection("")
    }
  }

  const handleSubmit = async () => {
    if (!grade || selectedSections.length === 0) {
      toast.error("Select a grade and at least one section")
      return
    }
    if (isAL && !stream) {
      toast.error("Select a stream for A/L classes")
      return
    }

    const payload = selectedSections.map((section) => ({
      academicYear: activeYear,
      grade: Number(grade),
      section,
      stream: isAL && stream ? stream : null,
    }))

    await createClasses.mutateAsync(payload)
    setOpen(false)
    setGrade("")
    setSelectedSections([])
    setStream("")
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <HugeiconsIcon icon={GridIcon} strokeWidth={2} className="size-4" />
          Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Bulk Add Classes — {activeYear}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Grade */}
          <div className="space-y-1.5">
            <Label>Grade</Label>
            <Select
              value={grade}
              onValueChange={(v) => {
                setGrade(v)
                setSelectedSections([])
                setStream("")
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Grade {g} {g >= 12 ? "(A/L)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stream — only for 12/13 */}
          {isAL && (
            <div className="space-y-1.5">
              <Label>Stream</Label>
              <div className="flex flex-wrap gap-2">
                {STREAMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStream(s)
                      setSelectedSections([])
                    }}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      stream === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/30 hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {grade && (!isAL || stream) && (
            <div className="space-y-1.5">
              <Label>Sections</Label>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSection(s)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedSections.includes(s)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/30 hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Custom section input */}
              <div className="flex gap-2 pt-1">
                <Input
                  placeholder="Custom section (e.g. M4)"
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSection()}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSection}
                  className="h-8"
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedSections.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Will create {selectedSections.length} class
                {selectedSections.length > 1 ? "es" : ""}:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedSections.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    Grade {grade}-{s}
                    {stream ? ` (${stream})` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                createClasses.isPending || selectedSections.length === 0
              }
            >
              {createClasses.isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="size-4 animate-spin"
                />
              )}
              Create{" "}
              {selectedSections.length > 0 ? selectedSections.length : ""} Class
              {selectedSections.length !== 1 ? "es" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── single add dialog ─────────────────────────────────────────────────────────

interface SingleAddDialogProps {
  activeYear: string
  onDone: () => void
}

function SingleAddDialog({ activeYear, onDone }: SingleAddDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [grade, setGrade] = React.useState("")
  const [section, setSection] = React.useState("")
  const [stream, setStream] = React.useState<Stream | "">("")
  const createClasses = useCreateClasses()

  const isAL = grade === "12" || grade === "13"

  const handleSubmit = async () => {
    if (!grade || !section.trim()) {
      toast.error("Grade and section are required")
      return
    }
    if (isAL && !stream) {
      toast.error("Select a stream for A/L classes")
      return
    }

    await createClasses.mutateAsync({
      academicYear: activeYear,
      grade: Number(grade),
      section: section.trim().toUpperCase(),
      stream: isAL && stream ? stream : null,
    })

    setOpen(false)
    setGrade("")
    setSection("")
    setStream("")
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Add Class
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Add Class — {activeYear}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Grade</Label>
            <Select
              value={grade}
              onValueChange={(v) => {
                setGrade(v)
                setStream("")
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Grade {g} {g >= 12 ? "(A/L)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAL && (
            <div className="space-y-1.5">
              <Label>Stream</Label>
              <Select
                value={stream}
                onValueChange={(v) => setStream(v as Stream)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {STREAMS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Section</Label>
            <Input
              placeholder={isAL ? "e.g. M1, B2, C1" : "e.g. A, B, C"}
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Will be uppercased automatically
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={createClasses.isPending}
            >
              {createClasses.isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="size-4 animate-spin"
                />
              )}
              Create Class
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const { year, setYear } = useActiveYear()
  const { data: allClasses = [], isLoading, refetch } = useClassesQuery(year)
  const deleteClass = useDeleteClass()
  const years = generateYears()
  const [search, setSearch] = React.useState("")
  const [gradeFilter, setGradeFilter] = React.useState("all")

  const grades = React.useMemo(() => {
    const set = new Set(allClasses.map((c) => c.grade))
    return Array.from(set).sort((a, b) => a - b)
  }, [allClasses])

  const filtered = React.useMemo(() => {
    let result = [...allClasses]

    // Filter by grade
    if (gradeFilter !== "all") {
      result = result.filter((c) => c.grade === Number(gradeFilter))
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.section.toLowerCase().includes(q) ||
          (c.stream?.toLowerCase().includes(q) ?? false)
      )
    }

    // Sort by grade then section
    result.sort((a, b) =>
      a.grade !== b.grade
        ? a.grade - b.grade
        : a.section.localeCompare(b.section)
    )

    return result
  }, [allClasses, gradeFilter, search])

  const handleDelete = async (id: string) => {
    await deleteClass.mutateAsync(id)
  }

  return (
    <div className="space-y-6">
      {/* Header - Title and Year Selector */}
      <div className="flex flex-col gap-4">
        {/* Title Line with Year Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex shrink-0 items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight whitespace-nowrap">
              Class Management
            </h1>
            <div className="flex items-center gap-2 overflow-x-auto">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    year === y
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border border-border bg-background hover:bg-muted"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs font-medium whitespace-nowrap text-muted-foreground sm:ml-auto">
            {filtered.length} class{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          Manage classes and sections for each academic year
        </p>

        {/* Controls Line - Buttons, Search, Filter */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          <BulkAddDialog activeYear={year} onDone={refetch} />
          <SingleAddDialog activeYear={year} onDone={refetch} />

          <div className="relative w-full sm:w-40">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-10 text-sm"
            />
          </div>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="h-9 w-full text-sm sm:w-40">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {grades.map((g) => (
                <SelectItem key={g} value={String(g)}>
                  Grade {g} {g >= 12 ? "(A/L)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Grid */}
      <ClassesGrid
        classes={filtered}
        loading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )
}
