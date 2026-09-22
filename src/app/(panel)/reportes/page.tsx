"use client"

import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { endOfDay, isWithinInterval, startOfDay, subDays } from "date-fns"
import { Download, PackageX } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Field, FieldLabel } from "@/components/ui/field"

import { orders } from "@/mocks/orders"
import { allVariants, getProductByVariantId } from "@/mocks/products"
import { orderStatusMeta } from "@/lib/status"
import { formatDate, formatMoney } from "@/lib/format"
import type { OrderStatus } from "@/types"

function defaultRange(): { from: Date; to: Date } {
  return { from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ReportesPage() {
  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [threshold, setThreshold] = useState(60)

  const fallback = defaultRange()
  const from = range?.from ?? fallback.from
  const to = range?.to ?? range?.from ?? fallback.to

  const ordersInRange = useMemo(
    () =>
      orders.filter((o) => {
        if (!isWithinInterval(new Date(o.createdAt), { start: from, end: to })) return false
        if (status !== "ALL" && o.status !== status) return false
        return true
      }),
    [from, to, status]
  )

  const paidOrders = ordersInRange.filter((o) => o.paidAt)
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const avgTicket = paidOrders.length ? revenue / paidOrders.length : 0

  const byStatus = (Object.keys(orderStatusMeta) as OrderStatus[]).map((s) => {
    const items = ordersInRange.filter((o) => o.status === s)
    return { status: s, count: items.length, total: items.reduce((sum, o) => sum + Number(o.total), 0) }
  })

  const lowStock = allVariants
    .filter((v) => v.stock < threshold)
    .sort((a, b) => a.stock - b.stock)
    .map((v) => ({ ...v, productName: getProductByVariantId(v.id)?.name ?? "" }))

  function exportOrders() {
    const header = ["Número", "Cliente", "Correo", "Fecha", "Estado", "Total"]
    const rows = ordersInRange.map((o) => [o.number, o.buyerName, o.buyerEmail, formatDate(o.createdAt), orderStatusMeta[o.status].label, o.total])
    downloadCsv(`pedidos-${formatDate(from)}-${formatDate(to)}.csv`, [header, ...rows])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Desempeño de pedidos e inventario en el rango seleccionado."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Ingresos" value={formatMoney(revenue)} />
        <StatCard label="Pedidos pagados" value={String(paidOrders.length)} />
        <StatCard label="Ticket promedio" value={formatMoney(avgTicket)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desglose por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byStatus.map((row) => (
                <TableRow key={row.status}>
                  <TableCell>
                    <StatusBadge meta={orderStatusMeta[row.status]} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                  <TableCell className="text-right">
                    <Money value={row.total} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pedidos del periodo ({ordersInRange.length})</CardTitle>
          <div className="flex items-center gap-2">
            <NativeSelect size="sm" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}>
              <NativeSelectOption value="ALL">Todos los estados</NativeSelectOption>
              {Object.keys(orderStatusMeta).map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {orderStatusMeta[s as OrderStatus].label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button variant="outline" size="sm" onClick={exportOrders}>
              <Download className="size-3.5" strokeWidth={1.75} />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersInRange.slice(0, 100).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.number}</TableCell>
                  <TableCell className="max-w-40 truncate">{o.buyerName}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge meta={orderStatusMeta[o.status]} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={o.total} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Stock bajo</CardTitle>
          <Field orientation="horizontal" className="w-auto">
            <FieldLabel htmlFor="threshold" className="text-xs">
              Umbral
            </FieldLabel>
            <Input
              id="threshold"
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-20"
            />
          </Field>
        </CardHeader>
        <CardContent className="px-0">
          {lowStock.length === 0 ? (
            <EmptyState icon={PackageX} title="Todo en orden" description="Ninguna variante está bajo el umbral." className="border-0" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      {v.productName} · {[v.size, v.color].filter(Boolean).join(" ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.sku}</TableCell>
                    <TableCell className="text-right tabular-nums text-danger">{v.stock} u.</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
