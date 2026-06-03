"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare02Icon,
  StudentIcon,
  Sun01Icon,
  Moon02Icon,
  Add01Icon,
  UserCircleIcon,
  TeacherIcon,
  SchoolIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@asgardeo/nextjs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/use-session"
import { Skeleton } from "@/components/ui/skeleton"
import type { AppRole } from "@/lib/session"

const superAdminNavItems = [
  { title: "Dashboard", href: "/", icon: DashboardSquare02Icon },
  { title: "All Students", href: "/students", icon: StudentIcon },
  { title: "Teachers", href: "/teachers", icon: TeacherIcon },
  { title: "Classes", href: "/classes", icon: SchoolIcon },
  { title: "Add Student", href: "/students/new", icon: Add01Icon },
] as const

const teacherNavItems = [
  { title: "All Students", href: "/students", icon: StudentIcon },
  { title: "Add Student", href: "/students/new", icon: Add01Icon },
] as const

function getNavItems(roles: AppRole[]) {
  if (roles.includes("super_admin")) return superAdminNavItems
  if (roles.includes("teacher")) return teacherNavItems
  return []
}

export function TopNav() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const { data: session, isLoading: sessionLoading } = useSession()

  const roles = session?.roles ?? []
  const navItems = getNavItems(roles)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="hidden shrink-0 flex-col leading-tight sm:flex lg:min-w-0"
        >
          <span className="truncate font-heading text-base font-semibold">
            Student Information Platform
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Wellawa Central College
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <SignedIn>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 sm:hidden"
              >
                <HugeiconsIcon
                  icon={Menu01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader className="mb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-3"
                    >
                      <HugeiconsIcon
                        icon={item.icon}
                        strokeWidth={2}
                        className="size-4 shrink-0"
                      />
                      <span>{item.title}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </SignedIn>

        {/* Desktop Navigation */}
        <SignedIn>
          <nav className="hidden items-center gap-1 sm:flex">
            {sessionLoading ? (
              <>
                <Skeleton className="h-8 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-8 w-20 rounded" />
              </>
            ) : (
              navItems.slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive(item.href) &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    <span className="hidden md:inline">{item.title}</span>
                  </Button>
                </Link>
              ))
            )}
          </nav>
        </SignedIn>

        <div className="flex-1" />

        {/* Add Student Button - Desktop only */}
        <SignedIn>
          <Link href="/students/new" className="hidden sm:inline">
            <Button size="sm" className="gap-1.5">
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="hidden md:inline">Add Student</span>
            </Button>
          </Link>
        </SignedIn>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="shrink-0"
          title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
        >
          <HugeiconsIcon
            icon={resolvedTheme === "dark" ? Sun01Icon : Moon02Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>

        {/* Auth Buttons */}
        <SignedOut>
          <SignInButton>
            <Button size="sm" className="gap-1.5">
              <HugeiconsIcon
                icon={UserCircleIcon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="shrink-0">
              <HugeiconsIcon
                icon={UserCircleIcon}
                strokeWidth={2}
                className="size-4"
              />
            </Button>
          </Link>
          <SignOutButton className="custom-signout" />
        </SignedIn>
      </div>

      <style>{`
        .custom-signout.asgardeo-button {
          height: 2.25rem !important;
          padding: 0 0.75rem !important;
          font-size: 0.8125rem !important;
          border-radius: 0.125rem !important;
        }
      `}</style>
    </header>
  )
}
