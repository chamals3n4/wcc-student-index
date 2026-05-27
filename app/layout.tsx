export const dynamic = "force-dynamic"

import { Geist, Geist_Mono, Roboto, Merriweather } from "next/font/google"

import "./globals.css"
import { AsgardeoProvider } from "@asgardeo/nextjs/server"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
})

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "700"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
export const metadata = {
  title: "WCC Student Information",
  description: "Student management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable,
        merriweatherHeading.variable
      )}
    >
      <body>
        <AsgardeoProvider>
          <ThemeProvider>
            <QueryProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </AsgardeoProvider>
      </body>
    </html>
  )
}
