import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/format"

export function Money({
  value,
  className,
  tone,
}: {
  value: string | number
  className?: string
  tone?: "default" | "muted" | "success" | "danger"
}) {
  const numeric = typeof value === "string" ? Number(value) : value
  const resolvedTone = tone ?? (numeric < 0 ? "danger" : "default")
  return (
    <span
      className={cn(
        "font-heading tabular-nums",
        resolvedTone === "muted" && "text-muted-foreground",
        resolvedTone === "success" && "text-success",
        resolvedTone === "danger" && "text-danger",
        className
      )}
    >
      {formatMoney(value)}
    </span>
  )
}
