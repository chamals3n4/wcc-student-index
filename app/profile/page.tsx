"use client"

import { SignedIn, SignedOut, UserProfile } from "@asgardeo/nextjs"

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        My Profile
      </h1>

      <SignedIn>
        <div className="mx-auto w-full max-w-lg">
          <UserProfile />
        </div>
      </SignedIn>

      <SignedOut>
        <p className="text-sm text-muted-foreground">
          You are not signed in. Please sign in to view your profile.
        </p>
      </SignedOut>
    </div>
  )
}
