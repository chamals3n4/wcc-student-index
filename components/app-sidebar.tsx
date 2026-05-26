"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare02Icon,
  StudentIcon,
  SchoolIcon,
  Sun01Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: DashboardSquare02Icon,
  },
  {
    title: "All Students",
    href: "/students",
    icon: StudentIcon,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-heading text-sm font-semibold">
                    Student INDEX
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Wellawa Central College
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  size="default"
                  isActive={
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)
                  }
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <HugeiconsIcon
                      icon={item.icon}
                      strokeWidth={2}
                      className="size-5"
                    />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 px-2 text-muted-foreground"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <HugeiconsIcon
            icon={resolvedTheme === "dark" ? Sun01Icon : Moon02Icon}
            strokeWidth={2}
            className="size-5"
          />
          <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
