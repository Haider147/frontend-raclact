import { cn } from "@/lib/utils"
import type { StatusMeta, StatusTone } from "@/lib/status"

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-[#8a5a15] dark:text-warning",
  danger: "bg-danger/12 text-danger",
  leaf: "bg-leaf/12 text-leaf",
  berry: "bg-berry/12 text-berry",
}

export function StatusBadge({
  meta,
  className,
}: {
  meta: StatusMeta
  className?: string
}) {
  const Icon = meta.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[meta.tone],
        className
      )}
    >
      <Icon strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
