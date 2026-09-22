"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { isWithinInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Boxes } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { AdjustStockDialog } from "@/components/inventario/adjust-stock-dialog"

import { allVariants, getProductByVariantId, LOW_STOCK_THRESHOLD } from "@/mocks/products"
import { stockMovements } from "@/mocks/inventory"
import { customers } from "@/mocks/customers"
import { stockMovementReasonMeta } from "@/lib/status"
import { formatDateTime } from "@/lib/format"
import type { ManualStockMovementReason, ProductVariant, StockMovement, StockMovementReason } from "@/types"

interface VariantRow extends ProductVariant {
  productName: string
}

const currentAdmin = customers.find((c) => c.role === "ADMIN")

function stockColumns(
  onAdjust: (variant: VariantRow, input: { reason: ManualStockMovementReason; quantity: number; note: string }) => void
): DataTableColumnDef<VariantRow>[] {
  return [
    {
      id: "product",
      header: "Producto",
      cell: ({ row }) => (
        <Link href={`/inventario/${row.original.id}`} className="font-medium hover:text-copper hover:underline">
          {row.original.productName}
        </Link>
      ),
    },
    { accessorKey: "sku", header: "SKU" },
    {
      id: "presentation",
      header: "Presentación",
      cell: ({ row }) => [row.original.size, row.original.color].filter(Boolean).join(" · "),
    },
    {
      accessorKey: "stock",
      header: "Stock actual",
      cell: ({ row }) => <span className="tabular-nums">{row.original.stock} u.</span>,
    },
    {
      id: "semaforo",
      header: "Semáforo",
      enableSorting: false,
      cell: ({ row }) => {
        const stock = row.original.stock
        if (stock < LOW_STOCK_THRESHOLD) return <Badge variant="destructive">Bajo</Badge>
        if (stock < LOW_STOCK_THRESHOLD * 1.5)
          return <Badge className="bg-warning/15 text-[#8a5a15] dark:text-warning">Ajustado</Badge>
        return <Badge className="bg-success/12 text-success">Saludable</Badge>
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <AdjustStockDialog
          variantLabel={`${row.original.productName} · ${row.original.sku}`}
          onAdjust={(input) => onAdjust(row.original, input)}
        />
      ),
    },
  ]
}

export default function InventarioPage() {
  const [tab, setTab] = useState("existencias")
  const [variants, setVariants] = useState<ProductVariant[]>(allVariants)
  const [movements, setMovements] = useState<StockMovement[]>(stockMovements)

  function adjustStock(
    variant: ProductVariant,
    input: { reason: ManualStockMovementReason; quantity: number; note: string }
  ) {
    setVariants((prev) =>
      prev.map((v) => (v.id === variant.id ? { ...v, stock: v.stock + input.quantity } : v))
    )
    setMovements((prev) => [
      {
        id: `mv_manual_${Date.now()}`,
        variantId: variant.id,
        reason: input.reason,
        quantity: input.quantity,
        balanceAfter: variant.stock + input.quantity,
        note: input.note || null,
        createdById: currentAdmin?.id ?? null,
        createdByName: currentAdmin?.name ?? null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const variantRows: VariantRow[] = variants
    .map((v) => ({ ...v, productName: getProductByVariantId(v.id)?.name ?? "" }))
    .sort((a, b) => a.stock - b.stock)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Existencias por variante y el kardex de movimientos que las explica."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList>
          <TabsTrigger value="existencias">Existencias</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos (kardex)</TabsTrigger>
        </TabsList>
        <TabsContent value="existencias" className="pt-4">
          <DataTable columns={stockColumns(adjustStock)} data={variantRows} />
        </TabsContent>
        <TabsContent value="movimientos" className="pt-4">
          <MovementsTab variants={variants} movements={movements} onAdjust={adjustStock} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MovementsTab({
  variants,
  movements,
  onAdjust,
}: {
  variants: ProductVariant[]
  movements: StockMovement[]
  onAdjust: (
    variant: ProductVariant,
    input: { reason: ManualStockMovementReason; quantity: number; note: string }
  ) => void
}) {
  const [variantId, setVariantId] = useState("ALL")
  const [reason, setReason] = useState<StockMovementReason | "ALL">("ALL")
  const [range, setRange] = useState<DateRange | undefined>(undefined)

  const selectedVariant = variants.find((v) => v.id === variantId)

  const filtered = useMemo(() => {
    return movements
      .filter((m) => {
        if (variantId !== "ALL" && m.variantId !== variantId) return false
        if (reason !== "ALL" && m.reason !== reason) return false
        if (
          range?.from &&
          range?.to &&
          !isWithinInterval(new Date(m.createdAt), { start: range.from, end: range.to })
        ) {
          return false
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [movements, variantId, reason, range])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect value={variantId} onChange={(e) => setVariantId(e.target.value)} className="w-52">
          <NativeSelectOption value="ALL">Todas las variantes</NativeSelectOption>
          {variants.map((v) => (
            <NativeSelectOption key={v.id} value={v.id}>
              {getProductByVariantId(v.id)?.name} · {[v.size, v.color].filter(Boolean).join(" ")}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          value={reason}
          onChange={(e) => setReason(e.target.value as StockMovementReason | "ALL")}
          className="w-44"
        >
          <NativeSelectOption value="ALL">Todos los motivos</NativeSelectOption>
          {Object.keys(stockMovementReasonMeta).map((r) => (
            <NativeSelectOption key={r} value={r}>
              {stockMovementReasonMeta[r as StockMovementReason].label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <DateRangePicker value={range} onChange={setRange} />
        {selectedVariant ? (
          <AdjustStockDialog
            variantLabel={`${getProductByVariantId(selectedVariant.id)?.name} · ${selectedVariant.sku}`}
            onAdjust={(input) => onAdjust(selectedVariant, input)}
          />
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Boxes} title="Sin movimientos" description="No hay movimientos con estos filtros." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="h-10 border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-3">Fecha</th>
                <th className="px-3">Variante</th>
                <th className="px-3">Motivo</th>
                <th className="px-3 text-right">Cantidad</th>
                <th className="px-3 text-right">Saldo</th>
                <th className="px-3">Nota</th>
                <th className="px-3">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((m) => {
                const variant = variants.find((v) => v.id === m.variantId)
                return (
                  <tr key={m.id} className="h-12 border-b border-border/60 last:border-0">
                    <td className="px-3 text-muted-foreground">{formatDateTime(m.createdAt)}</td>
                    <td className="px-3">
                      {getProductByVariantId(m.variantId)?.name} · {variant?.sku}
                    </td>
                    <td className="px-3">
                      <StatusBadge meta={stockMovementReasonMeta[m.reason]} />
                    </td>
                    <td className={`px-3 text-right tabular-nums ${m.quantity < 0 ? "text-danger" : "text-success"}`}>
                      {m.quantity > 0 ? "+" : ""}
                      {m.quantity}
                    </td>
                    <td className="px-3 text-right tabular-nums">{m.balanceAfter}</td>
                    <td className="max-w-56 truncate px-3 text-muted-foreground">{m.note ?? "—"}</td>
                    <td className="px-3 text-muted-foreground">{m.createdByName ?? "Sistema"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
