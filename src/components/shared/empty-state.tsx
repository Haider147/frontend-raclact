import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandBlob } from "@/components/shared/brand-blob"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-border px-6 py-16 text-center",
        className
      )}
    >
      <BrandBlob
        variant="b"
        className="pointer-events-none absolute -top-24 -right-24 size-64 text-taupe/60 dark:text-secondary/50"
      />
      {Icon ? (
        <span className="relative flex size-12 items-center justify-center rounded-full bg-accent text-navy dark:text-cream">
          <Icon strokeWidth={1.75} className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <div className="relative space-y-1">
        <p className="font-heading text-base font-semibold text-navy dark:text-cream">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="relative pt-2">{action}</div> : null}
    </div>
  )
}
