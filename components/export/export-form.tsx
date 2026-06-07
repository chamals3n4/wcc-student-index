"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useExportStudents } from "@/hooks/use-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  Download04Icon,
  Cancel01Icon,
  FileExportIcon,
} from "@hugeicons/core-free-icons"

export function ExportForm() {
  const router = useRouter()
  const { mutate: exportStudents, isPending } = useExportStudents()

  const [grade, setGrade] = React.useState("")
  const [section, setSection] = React.useState("")
  const [stream, setStream] = React.useState("")
  const [academicYear, setAcademicYear] = React.useState(
    new Date().getFullYear().toString()
  )

  const grades = Array.from({ length: 13 }, (_, i) => (i + 1).toString())
  const streams = ["Maths", "Bio", "Commerce", "Art"]

  const sectionsByGrade: Record<string, string[]> = {
    ...Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [
        (i + 1).toString(),
        ["A", "B", "C", "D"],
      ])
    ),
    "12": ["M1", "M2", "B1", "B2", "C1", "C2", "A1", "A2"],
    "13": ["M1", "M2", "B1", "B2", "C1", "C2", "A1", "A2"],
  }

  const isSeniorGrade = grade === "12" || grade === "13"
  const availableSections = grade ? sectionsByGrade[grade] || [] : []

  const handleExport = (exportAll: boolean = false) => {
    exportStudents({
      grade,
      section,
      stream,
      year: academicYear,
      exportAll,
    })
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Export Student Data
        </h1>
      </div>

      <Card className="py-5">
        <CardContent className="px-6">
          <div className="space-y-4">
            {/* Academic Year */}
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-sm">
                Academic Year
              </Label>
              <Input
                id="year"
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
                className="h-10"
              />
            </div>

            {/* Grade */}
            <div className="space-y-1.5">
              <Label htmlFor="grade" className="text-sm">
                Grade
              </Label>
              <Select
                value={grade}
                onValueChange={(value) => {
                  setGrade(value ?? "")
                  setSection("")
                  setStream("")
                }}
              >
                <SelectTrigger id="grade" className="h-10 w-full">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stream (12-13 only) */}
            {isSeniorGrade && (
              <div className="space-y-1.5">
                <Label htmlFor="stream" className="text-sm">
                  Stream
                </Label>
                <Select
                  value={stream}
                  onValueChange={(value) => {
                    setStream(value ?? "")
                    setSection("")
                  }}
                >
                  <SelectTrigger id="stream" className="h-10 w-full">
                    <SelectValue
                      placeholder={`All Streams (Entire Grade ${grade})`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {streams.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Section */}
            {grade && !stream && (
              <div className="space-y-1.5">
                <Label htmlFor="section" className="text-sm">
                  Section
                </Label>
                <Select
                  value={section}
                  onValueChange={(value) => setSection(value ?? "")}
                >
                  <SelectTrigger id="section" className="h-10 w-full">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Info banner */}
            {isSeniorGrade && stream && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                  Exporting Grade {grade} {stream} stream
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                disabled={isPending}
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
                type="button"
                variant="outline"
                onClick={() => handleExport(true)}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    strokeWidth={2}
                    className="size-4 animate-spin"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={FileExportIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                Export All
              </Button>

              <Button
                type="button"
                onClick={() => handleExport(false)}
                disabled={isPending || (!grade && !stream)}
                className="w-full gap-2 sm:w-auto"
              >
                {isPending ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    strokeWidth={2}
                    className="size-4 animate-spin"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Download04Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
                Export Selected
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              * Export Selected requires at least a grade or stream
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
