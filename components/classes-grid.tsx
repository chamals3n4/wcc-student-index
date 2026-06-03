"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  SchoolIcon,
} from "@hugeicons/core-free-icons"
import type { Class } from "@/lib/types"

interface ClassesGridProps {
  classes: Class[]
  loading: boolean
  onDelete: (id: string) => void
  pageSize?: number
  page?: number
  onPageChange?: (page: number) => void
}

export function ClassesGrid({
  classes,
  loading,
  onDelete,
  pageSize = 24,
  page: externalPage = 1,
  onPageChange,
}: ClassesGridProps) {
  const [internalPage, setInternalPage] = React.useState(1)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [classToDelete, setClassToDelete] = React.useState<Class | null>(null)

  const page = onPageChange ? externalPage : internalPage
  const setPage = onPageChange
    ? onPageChange
    : (p: number) => setInternalPage(p)

  const totalPages = Math.max(1, Math.ceil(classes.length / pageSize))
  const paginated = classes.slice((page - 1) * pageSize, page * pageSize)
  const startItem = classes.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, classes.length)

  const gradeColor = (grade: number): string => {
    if (grade <= 5)
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    if (grade <= 9)
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    if (grade <= 11)
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
    return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Row List */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <HugeiconsIcon
            icon={SchoolIcon}
            strokeWidth={1.5}
            className="size-10 text-muted-foreground/50"
          />
          <div>
            <p className="text-sm font-medium">No classes found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((classItem) => (
              <Link
                key={classItem.id}
                href={`/classes/${classItem.id}`}
                className="block"
              >
                <div
                  className={`group flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-all hover:border-primary/50 hover:shadow-md ${gradeColor(classItem.grade)}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Grade and Section */}
                    <div className="min-w-0">
                      <p className="text-lg font-bold tracking-tight">
                        Grade {classItem.grade}
                        <span className="ml-2">{classItem.section}</span>
                      </p>
                      {classItem.stream && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {classItem.stream}
                        </p>
                      )}
                    </div>

                    {/* Year Badge */}
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {classItem.academicYear}
                    </Badge>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setClassToDelete(classItem)
                      setDeleteOpen(true)
                    }}
                    className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Delete class"
                  >
                    <HugeiconsIcon
                      icon={Delete01Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                {startItem}-{endItem} of {classes.length}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="gap-1.5"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="h-9 w-9 p-0"
                      >
                        {p}
                      </Button>
                    )
                  })}
                  {totalPages > 7 && (
                    <span className="px-2 text-sm text-muted-foreground">
                      ...
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="gap-1.5"
                >
                  <span className="hidden sm:inline">Next</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete Class
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                Grade {classToDelete?.grade} - {classToDelete?.section}
              </span>
              {classToDelete?.stream && (
                <>
                  {" "}
                  (
                  <span className="text-foreground">
                    {classToDelete.stream}
                  </span>
                  )
                </>
              )}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault()
                if (classToDelete) {
                  onDelete(classToDelete.id)
                  setDeleteOpen(false)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
