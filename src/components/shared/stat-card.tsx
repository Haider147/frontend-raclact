"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPercent,
  deltaLabel = "vs. periodo anterior",
  sparkline,
  className,
}: {
  label: string
  value: string
  icon?: LucideIcon
  deltaPercent?: number
  deltaLabel?: string
  sparkline?: number[]
  className?: string
}) {
  const isPositive = (deltaPercent ?? 0) >= 0
  const data = sparkline?.map((v, i) => ({ i, v }))

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-navy dark:text-cream">
              <Icon strokeWidth={1.75} className="size-4" aria-hidden="true" />
            </span>
          ) : null}
        </div>

        <p className="font-heading text-2xl font-semibold tracking-tight text-navy dark:text-cream">
          {value}
        </p>

        <div className="flex items-center justify-between gap-3">
          {deltaPercent !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-success" : "text-danger"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
              )}
              {Math.abs(deltaPercent).toFixed(1)}%
              <span className="font-normal text-muted-foreground">{deltaLabel}</span>
            </span>
          ) : (
            <span />
          )}

          {data && data.length > 1 ? (
            <div className="h-8 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-copper)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--brand-copper)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--brand-copper)"
                    strokeWidth={1.75}
                    fill={`url(#spark-${label})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
