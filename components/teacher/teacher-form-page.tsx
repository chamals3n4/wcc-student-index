"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  Cancel01Icon,
  Mail02Icon,
  LockPasswordIcon,
  EyeIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons"

interface TeacherFormPageProps {
  onSubmit: (data: {
    firstName: string
    lastName: string
    email: string
    mode: "set_password" | "invite"
    password?: string
  }) => Promise<boolean>
}

export function TeacherFormPage({ onSubmit }: TeacherFormPageProps) {
  const router = useRouter()
  const [mode, setMode] = React.useState<"set_password" | "invite">("invite")
  const [showPassword, setShowPassword] = React.useState(false)
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev }
        delete n[name]
        return n
      })
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = "First name is required"
    if (!form.lastName.trim()) errs.lastName = "Last name is required"
    if (!form.email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format"
    if (mode === "set_password" && !form.password.trim())
      errs.password = "Password is required"
    if (mode === "set_password" && form.password.length < 8)
      errs.password = "Password must be at least 8 characters"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const result = await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mode,
        ...(mode === "set_password" && { password: form.password }),
      })
      if (result) {
        router.push("/teachers")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Add New Teacher
          </h1>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Kamal"
                    disabled={submitting}
                  />
                  {errors.firstName && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Silva"
                    disabled={submitting}
                  />
                  {errors.lastName && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="silva@wcc.edu.lk"
                  disabled={submitting}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Account Setup Method */}
              <div className="space-y-2">
                <Label>Account Setup Method</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMode("invite")}
                    disabled={submitting}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                      mode === "invite"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={Mail02Icon}
                      strokeWidth={2}
                      className={`size-4 shrink-0 ${mode === "invite" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-medium">Send Invite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("set_password")}
                    disabled={submitting}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                      mode === "set_password"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={LockPasswordIcon}
                      strokeWidth={2}
                      className={`size-4 shrink-0 ${mode === "set_password" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-medium">Set Password</span>
                  </button>
                </div>
              </div>

              {/* Password field — only for set_password mode */}
              {mode === "set_password" && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Temporary Password{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      disabled={submitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={submitting}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <HugeiconsIcon
                        icon={showPassword ? ViewOffSlashIcon : EyeIcon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Teacher will be asked to verify their email and can reset
                    this password on first login.
                  </p>
                </div>
              )}

              {/* Info banner */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                  {mode === "invite"
                    ? "An email will be sent to the teacher with a link to activate their account and set a password."
                    : "A teacher role will be assigned in Asgardeo automatically. The teacher can log in with the temporary password."}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push("/teachers")}
                  disabled={submitting}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && (
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      strokeWidth={2}
                      className="size-4 animate-spin"
                    />
                  )}
                  {mode === "invite" ? "Send Invite" : "Create Account"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
