"use client"

import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
  subDays,
} from "date-fns"
import { CircleDollarSign, PackageX, Receipt, ShoppingCart } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { OrdersByStatusChart } from "@/components/dashboard/orders-by-status-chart"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { OpsPanel } from "@/components/dashboard/ops-panel"

import { orders } from "@/mocks/orders"
import { allVariants, getProductByVariantId, LOW_STOCK_THRESHOLD } from "@/mocks/products"
import { pendingReviews } from "@/mocks/reviews"
import { formatMoney } from "@/lib/format"
import type { OrderStatus } from "@/types"

function defaultRange(): { from: Date; to: Date } {
  return { from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }
}

function percentDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function dayKey(date: string | Date): string {
  return format(new Date(date), "yyyy-MM-dd")
}

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const fallback = defaultRange()
  const from = range?.from ?? fallback.from
  const to = range?.to ?? range?.from ?? fallback.to

  const rangeLength = differenceInCalendarDays(to, from) + 1
  const prevFrom = subDays(from, rangeLength)
  const prevTo = subDays(to, rangeLength)

  const ordersInRange = useMemo(
    () => orders.filter((o) => isWithinInterval(new Date(o.createdAt), { start: from, end: to })),
    [from, to]
  )
  const paidInRange = useMemo(
    () => orders.filter((o) => o.paidAt && isWithinInterval(new Date(o.paidAt), { start: from, end: to })),
    [from, to]
  )
  const paidInPrevRange = useMemo(
    () =>
      orders.filter((o) => o.paidAt && isWithinInterval(new Date(o.paidAt), { start: prevFrom, end: prevTo })),
    [prevFrom, prevTo]
  )

  const revenue = paidInRange.reduce((sum, o) => sum + Number(o.total), 0)
  const prevRevenue = paidInPrevRange.reduce((sum, o) => sum + Number(o.total), 0)
  const avgTicket = paidInRange.length ? revenue / paidInRange.length : 0
  const prevAvgTicket = paidInPrevRange.length ? prevRevenue / paidInPrevRange.length : 0

  const dailyBuckets = useMemo(() => {
    return eachDayOfInterval({ start: from, end: to }).map((day) => {
      const key = dayKey(day)
      const dayOrders = paidInRange.filter((o) => dayKey(o.paidAt!) === key)
      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total), 0)
      return { date: day.toISOString(), revenue: dayRevenue, count: dayOrders.length }
    })
  }, [from, to, paidInRange])

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      PENDING: 0, PAID: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0,
    }
    for (const o of ordersInRange) counts[o.status]++
    return counts
  }, [ordersInRange])

  const recentOrders = [...ordersInRange]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const lowStockVariants = allVariants
    .filter((v) => v.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .map((v) => ({ ...v, productName: getProductByVariantId(v.id)?.name ?? "" }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo de RacLact — pedidos, ingresos e inventario."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ingresos del periodo"
          value={formatMoney(revenue)}
          icon={CircleDollarSign}
          deltaPercent={percentDelta(revenue, prevRevenue)}
          sparkline={dailyBuckets.map((d) => d.revenue)}
        />
        <StatCard
          label="Pedidos pagados"
          value={String(paidInRange.length)}
          icon={ShoppingCart}
          deltaPercent={percentDelta(paidInRange.length, paidInPrevRange.length)}
          sparkline={dailyBuckets.map((d) => d.count)}
        />
        <StatCard
          label="Ticket promedio"
          value={formatMoney(avgTicket)}
          icon={Receipt}
          deltaPercent={percentDelta(avgTicket, prevAvgTicket)}
          sparkline={dailyBuckets.map((d) => (d.count ? d.revenue / d.count : 0))}
        />
        <StatCard
          label="Variantes con stock bajo"
          value={String(lowStockVariants.length)}
          icon={PackageX}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueChart data={dailyBuckets} />
        <OrdersByStatusChart counts={statusCounts} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentOrdersTable orders={recentOrders} />
        <OpsPanel lowStockVariants={lowStockVariants} pendingReviews={pendingReviews} />
      </div>
    </div>
  )
}
