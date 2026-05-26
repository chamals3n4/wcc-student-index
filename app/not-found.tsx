export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 className="font-heading text-2xl font-semibold">
        404 — Page Not Found
      </h2>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
    </div>
  )
}
