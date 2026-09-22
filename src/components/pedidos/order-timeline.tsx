import { Ban, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"
import { orderStatusMeta, orderStatusTimeline } from "@/lib/status"
import type { Order } from "@/types"

export function OrderTimeline({ order }: { order: Order }) {
  const cancelledEntry = order.statusHistory.find((h) => h.status === "CANCELLED")

  return (
    <ol className="space-y-0">
      {orderStatusTimeline.map((step, i) => {
        const entry = order.statusHistory.find((h) => h.status === step)
        const stepIndex = orderStatusTimeline.indexOf(order.status as (typeof orderStatusTimeline)[number])
        const isCancelled = order.status === "CANCELLED"
        const reached = Boolean(entry)
        const isCurrent = !isCancelled && order.status === step
        const isLast = i === orderStatusTimeline.length - 1
        const meta = orderStatusMeta[step]
        const Icon = meta.icon

        return (
          <li key={step} className="relative flex gap-3 pb-8 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute top-7 left-[13px] h-[calc(100%-12px)] w-px",
                  reached && (stepIndex > i || (stepIndex === i && !isCancelled))
                    ? "bg-success"
                    : "bg-border"
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                reached
                  ? isCurrent
                    ? "border-info bg-info/10 text-info"
                    : "border-success bg-success/10 text-success"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {reached ? <Check className="size-3.5" strokeWidth={2.5} /> : <Icon className="size-3.5" strokeWidth={1.75} />}
            </span>
            <div className="pt-0.5">
              <p className={cn("text-sm font-medium", reached ? "text-foreground" : "text-muted-foreground")}>
                {meta.label}
              </p>
              {entry ? (
                <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
              ) : (
                <p className="text-xs text-muted-foreground/70">Pendiente</p>
              )}
            </div>
          </li>
        )
      })}

      {cancelledEntry ? (
        <li className="relative flex gap-3 pt-1">
          <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-danger bg-danger/10 text-danger">
            <Ban className="size-3.5" strokeWidth={2} />
          </span>
          <div className="pt-0.5">
            <p className="text-sm font-medium text-danger">Cancelado</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(cancelledEntry.createdAt)}</p>
            {cancelledEntry.note ? (
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">{cancelledEntry.note}</p>
            ) : null}
          </div>
        </li>
      ) : null}
    </ol>
  )
}
