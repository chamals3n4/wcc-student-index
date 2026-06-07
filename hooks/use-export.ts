import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface ExportParams {
  grade?: string
  section?: string
  stream?: string
  year?: string
  exportAll?: boolean
}

async function exportStudents(params: ExportParams) {
  const { exportAll, ...filters } = params
  const searchParams = new URLSearchParams()

  if (filters.year) searchParams.set("year", filters.year)

  if (!exportAll) {
    if (filters.grade) searchParams.set("grade", filters.grade)
    if (filters.section) searchParams.set("section", filters.section)
    if (filters.stream) searchParams.set("stream", filters.stream)
  }

  const res = await fetch(`/api/export/students?${searchParams.toString()}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Export failed" }))
    throw new Error(err.error)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url

  const contentDisposition = res.headers.get("content-disposition")
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
  link.download = filenameMatch?.[1] || "students.xlsx"

  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function useExportStudents() {
  return useMutation({
    mutationFn: exportStudents,
    onSuccess: () => {
      toast.success("Export downloaded successfully")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to export students")
    },
  })
}
