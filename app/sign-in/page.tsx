"use client"

import { SignIn } from "@asgardeo/nextjs"
import Image from "next/image"

export default function SignInPage() {
  return (
    <div className="flex h-svh items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        <style>{`
          .custom-signin .asgardeo-card__title {
            font-size: 0 !important;
          }
          .custom-signin .asgardeo-card__title::after {
            content: "WCC Student Index";
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1.2;
          }
          .custom-signin .asgardeo-card__header p {
            font-size: 0 !important;
          }
          .custom-signin .asgardeo-card__header p::after {
            content: "Enter your email and password to continue.";
            font-size: 0.875rem;
            color: inherit;
          }
          .custom-signin label[for="username"] {
            font-size: 0 !important;
          }
          .custom-signin label[for="username"] span:first-child::after {
            content: "Email";
            display: inline-block;
          }
        `}</style>
        <SignIn className="custom-signin" />
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <Image
            src="/WSO2-Logo-Black.svg"
            alt="WSO2"
            width={80}
            height={24}
            className="h-5 w-auto dark:invert"
          />
          <span className="font-medium text-foreground">Asgardeo</span>
        </p>
      </div>
    </div>
  )
}
