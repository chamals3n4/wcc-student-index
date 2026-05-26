"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  StudentIcon,
  Book01Icon,
  ContactIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  totalStudents: number
  totalGrades: number
  totalToday: number
  loading?: boolean
}

export function StatsCards({
  totalStudents,
  totalGrades,
  totalToday,
  loading,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: StudentIcon,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Active Grades",
      value: totalGrades,
      icon: Book01Icon,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Added Today",
      value: totalToday,
      icon: Calendar01Icon,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Contacts",
      value: totalStudents,
      icon: ContactIcon,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} size="sm" className="py-4">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                stat.bgColor
              )}
            >
              <HugeiconsIcon
                icon={stat.icon}
                strokeWidth={2}
                className={cn("size-5", stat.color)}
              />
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <div className="font-heading text-3xl font-semibold tracking-tight">
                {stat.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
