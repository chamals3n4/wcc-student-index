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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Loading03Icon,
  GridIcon,
  Search01Icon,
  Alert02Icon,
  FilterIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { useSession } from "@/hooks/use-session"
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

  const content = (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Grade</Label>
        <Select
          value={grade}
          onValueChange={(v) => {
            if (v !== null) setGrade(v)
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
              className="h-8 shrink-0"
            >
              Add
            </Button>
          </div>
        </div>
      )}

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
          disabled={createClasses.isPending || selectedSections.length === 0}
        >
          {createClasses.isPending && (
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="size-4 animate-spin"
            />
          )}
          Create {selectedSections.length > 0 ? selectedSections.length : ""}{" "}
          Class{selectedSections.length !== 1 ? "es" : ""}
        </Button>
      </div>
    </div>
  )

  // Use Sheet on mobile, Dialog on desktop
  return (
    <>
      {/* Mobile — Sheet from bottom */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Button size="sm" variant="outline" className="w-full">
              <HugeiconsIcon
                icon={GridIcon}
                strokeWidth={2}
                className="size-4"
              />
              Bulk Add
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-8"
          >
            <SheetHeader className="mb-2">
              <SheetTitle className="font-heading">
                Bulk Add Classes — {activeYear}
              </SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop — Dialog */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm" variant="outline">
              <HugeiconsIcon
                icon={GridIcon}
                strokeWidth={2}
                className="size-4"
              />
              Bulk Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Bulk Add Classes — {activeYear}
              </DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
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

  const content = (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Grade</Label>
        <Select
          value={grade}
          onValueChange={(v) => {
            if (v !== null) setGrade(v)
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
          <Select value={stream} onValueChange={(v) => setStream(v as Stream)}>
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
  )

  return (
    <>
      {/* Mobile — Sheet from bottom */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Button size="sm" className="w-full">
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="size-4"
              />
              Add Class
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[80vh] overflow-y-auto rounded-t-2xl px-4 pb-8"
          >
            <SheetHeader className="mb-2">
              <SheetTitle className="font-heading">
                Add Class — {activeYear}
              </SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop — Dialog */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm">
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="size-4"
              />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Add Class — {activeYear}
              </DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const { data: session, isLoading: sessionLoading } = useSession()
  const { year, setYear } = useActiveYear()
  const { data: allClasses = [], isLoading, refetch } = useClassesQuery(year)
  const deleteClass = useDeleteClass()
  const years = generateYears()
  const [search, setSearch] = React.useState("")
  const [gradeFilter, setGradeFilter] = React.useState("all")
  const [showFilters, setShowFilters] = React.useState(false)

  const isSuperAdmin = session?.roles.includes("super_admin") ?? false

  const grades = React.useMemo(() => {
    const set = new Set(allClasses.map((c) => c.grade))
    return Array.from(set).sort((a, b) => a - b)
  }, [allClasses])

  const filtered = React.useMemo(() => {
    let result = [...allClasses]
    if (gradeFilter !== "all") {
      result = result.filter((c) => c.grade === Number(gradeFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.section.toLowerCase().includes(q) ||
          (c.stream?.toLowerCase().includes(q) ?? false)
      )
    }
    result.sort((a, b) =>
      a.grade !== b.grade
        ? a.grade - b.grade
        : a.section.localeCompare(b.section)
    )
    return result
  }, [allClasses, gradeFilter, search])

  React.useEffect(() => {
    if (!sessionLoading && session?.signedIn && !isSuperAdmin) {
      window.location.href = "/students"
    }
  }, [session, sessionLoading, isSuperAdmin])

  if (sessionLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-0">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
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
          Only administrators can manage classes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            Class Management
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage classes and sections for each academic year
          </p>
        </div>
        {/* Count badge — top right on mobile */}
        <span className="shrink-0 rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "class" : "classes"}
        </span>
      </div>

      {/* ── Academic year selector ── */}
      <div className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              year === y
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* ── Action bar ── */}
      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-2 sm:hidden">
        {/* Search full width */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search section or stream..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>

        {/* Filter toggle + action buttons row */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors ${
              showFilters || gradeFilter !== "all"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <HugeiconsIcon
              icon={FilterIcon}
              strokeWidth={2}
              className="size-4"
            />
            Filter
            {gradeFilter !== "all" && (
              <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                1
              </span>
            )}
          </button>
          <div className="flex flex-1 gap-2">
            <BulkAddDialog activeYear={year} onDone={refetch} />
            <SingleAddDialog activeYear={year} onDone={refetch} />
          </div>
        </div>

        {/* Collapsible grade filter */}
        {showFilters && (
          <Select
            value={gradeFilter}
            onValueChange={(v) => {
              if (v !== null) setGradeFilter(v)
            }}
          >
            <SelectTrigger className="h-9 w-full text-sm">
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
        )}
      </div>

      {/* Desktop: single row */}
      <div className="hidden items-center gap-2 sm:flex">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search section or stream..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>

        <Select
          value={gradeFilter}
          onValueChange={(v) => {
            if (v !== null) setGradeFilter(v)
          }}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
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

        <div className="ml-auto flex gap-2">
          <BulkAddDialog activeYear={year} onDone={refetch} />
          <SingleAddDialog activeYear={year} onDone={refetch} />
        </div>
      </div>

      {/* ── Classes grid ── */}
      <ClassesGrid
        classes={filtered}
        loading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )

  function handleDelete(id: string) {
    deleteClass.mutate(id)
  }
}
