"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ErrorState({
  title = "No se pudo cargar la información",
  description = "Intenta de nuevo en unos segundos.",
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle strokeWidth={1.75} className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold text-navy dark:text-cream">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
