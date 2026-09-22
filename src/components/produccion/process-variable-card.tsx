"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ProcessVariable } from "@/types"

export function ProcessVariableCard({ variable }: { variable: ProcessVariable }) {
  const withinRange = variable.currentValue >= variable.targetMin && variable.currentValue <= variable.targetMax
  const data = variable.history.map((h, i) => ({ i, v: h.value }))

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{variable.label}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              withinRange ? "bg-success/12 text-success" : "bg-warning/15 text-[#8a5a15] dark:text-warning"
            )}
          >
            {withinRange ? "En rango" : "Fuera de rango"}
          </span>
        </div>
        <p className="font-heading text-xl font-semibold text-navy dark:text-cream">
          {variable.currentValue}
          <span className="ml-1 text-sm font-normal text-muted-foreground">{variable.unit}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Objetivo: {variable.targetMin}–{variable.targetMax} {variable.unit}
        </p>
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`pv-${variable.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--func-info)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--func-info)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--func-info)"
                strokeWidth={1.75}
                fill={`url(#pv-${variable.key})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
