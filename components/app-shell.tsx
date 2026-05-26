"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SignedIn, SignedOut } from "@asgardeo/nextjs"
import { TopNav } from "@/components/top-nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSignInPage = pathname === "/sign-in"

  if (isSignInPage) {
    return <main className="min-h-svh w-full">{children}</main>
  }

  return (
    <>
      <SignedIn>
        <TopNav />
        <main className="min-h-[calc(100vh-3.5rem)] w-full">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function RedirectToSignIn() {
  useEffect(() => {
    window.location.href = "/sign-in"
  }, [])

  return null
}
