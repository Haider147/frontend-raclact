"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { orderStatusMeta } from "@/lib/status"
import type { OrderStatus } from "@/types"

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "var(--func-warning)",
  PAID: "var(--func-info)",
  SHIPPED: "var(--brand-leaf)",
  DELIVERED: "var(--func-success)",
  CANCELLED: "var(--func-danger)",
}

const chartConfig = Object.fromEntries(
  Object.entries(orderStatusMeta).map(([status, meta]) => [
    status,
    { label: meta.label, color: STATUS_COLORS[status as OrderStatus] },
  ])
) satisfies ChartConfig

export function OrdersByStatusChart({
  counts,
}: {
  counts: Record<OrderStatus, number>
}) {
  const data = (Object.keys(orderStatusMeta) as OrderStatus[])
    .map((status) => ({ status, label: orderStatusMeta[status].label, value: counts[status] ?? 0 }))
    .filter((d) => d.value > 0)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos por estado</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        {total === 0 ? (
          <p className="py-14 text-sm text-muted-foreground">Sin pedidos en el rango seleccionado.</p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} strokeWidth={2}>
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} stroke="var(--card)" />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {data.map((entry) => (
                <li key={entry.status} className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                  />
                  {entry.label}
                  <span className="ml-auto font-medium text-foreground tabular-nums">{entry.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
