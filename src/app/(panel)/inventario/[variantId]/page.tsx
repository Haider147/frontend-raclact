"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { AdjustStockDialog } from "@/components/inventario/adjust-stock-dialog"

import { allVariants, getProductByVariantId } from "@/mocks/products"
import { getMovementsByVariant } from "@/mocks/inventory"
import { customers } from "@/mocks/customers"
import { stockMovementReasonMeta } from "@/lib/status"
import { formatDateTime } from "@/lib/format"
import type { ManualStockMovementReason, ProductVariant, StockMovement } from "@/types"

const chartConfig = {
  balance: { label: "Saldo", color: "var(--brand-copper)" },
} satisfies ChartConfig

const currentAdmin = customers.find((c) => c.role === "ADMIN")

export default function VariantInventoryPage() {
  const { variantId } = useParams<{ variantId: string }>()
  const [variant, setVariant] = useState<ProductVariant | null | undefined>(undefined)
  const [movements, setMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = allVariants.find((v) => v.id === variantId) ?? null
      setVariant(found)
      setMovements(found ? getMovementsByVariant(found.id) : [])
    }, 500)
    return () => clearTimeout(timer)
  }, [variantId])

  const chartData = useMemo(
    () =>
      [...movements]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((m) => ({ date: m.createdAt, balance: m.balanceAfter })),
    [movements]
  )

  function adjustStock(input: { reason: ManualStockMovementReason; quantity: number; note: string }) {
    if (!variant) return
    const newBalance = variant.stock + input.quantity
    setVariant({ ...variant, stock: newBalance })
    setMovements((prev) => [
      {
        id: `mv_manual_${Date.now()}`,
        variantId: variant.id,
        reason: input.reason,
        quantity: input.quantity,
        balanceAfter: newBalance,
        note: input.note || null,
        createdById: currentAdmin?.id ?? null,
        createdByName: currentAdmin?.name ?? null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  if (variant === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  if (variant === null) {
    return (
      <ErrorState
        title="Variante no encontrada"
        description={`No existe ninguna variante con el id "${variantId}".`}
      />
    )
  }

  const product = getProductByVariantId(variant.id)

  return (
    <div className="space-y-6">
      <Link
        href="/inventario"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Inventario
      </Link>

      <PageHeader
        title={`${product?.name} · ${[variant.size, variant.color].filter(Boolean).join(" ")}`}
        description={`SKU ${variant.sku} — saldo actual: ${variant.stock} unidades`}
        actions={
          <AdjustStockDialog
            variantLabel={`${product?.name} · ${variant.sku}`}
            onAdjust={adjustStock}
          />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Evolución del saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <AreaChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-copper)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--brand-copper)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => formatDateTime(value).slice(0, 5)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(value) => formatDateTime(String(value))} />}
              />
              <Area
                type="stepAfter"
                dataKey="balance"
                stroke="var(--brand-copper)"
                strokeWidth={2}
                fill="url(#fillBalance)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kardex</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...movements]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(m.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge meta={stockMovementReasonMeta[m.reason]} />
                    </TableCell>
                    <TableCell className={`text-right tabular-nums ${m.quantity < 0 ? "text-danger" : "text-success"}`}>
                      {m.quantity > 0 ? "+" : ""}
                      {m.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{m.balanceAfter}</TableCell>
                    <TableCell className="max-w-56 truncate text-muted-foreground">{m.note ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.createdByName ?? "Sistema"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
