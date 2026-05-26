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
} from "@hugeicons/core-free-icons"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@asgardeo/nextjs"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { title: "Dashboard", href: "/", icon: DashboardSquare02Icon },
  { title: "All Students", href: "/students", icon: StudentIcon },
]

export function TopNav() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 flex-col leading-tight">
          <span className="font-heading text-base font-semibold">
            Student Index Platform
          </span>
          <span className="text-xs text-muted-foreground">
            Wellawa Central College
          </span>
        </Link>

        <SignedIn>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
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
                  <span className="hidden sm:inline">{item.title}</span>
                </Button>
              </Link>
            ))}
          </nav>
        </SignedIn>

        <div className="flex-1" />

        <SignedIn>
          <Link href="/students/new">
            <Button size="sm" className="gap-1.5">
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="hidden sm:inline">Add Student</span>
            </Button>
          </Link>
        </SignedIn>

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
            <Button variant="ghost" size="sm" className="gap-1.5">
              <HugeiconsIcon
                icon={UserCircleIcon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="hidden sm:inline">Profile</span>
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
