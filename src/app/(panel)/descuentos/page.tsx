"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Percent, Pencil, Plus } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { DiscountFormSheet } from "@/components/descuentos/discount-form-sheet"

import { discounts as initialDiscounts } from "@/mocks/discounts"
import { discountTypeLabel } from "@/lib/status"
import { formatDate, formatMoney } from "@/lib/format"
import type { DiscountCode } from "@/types"

export default function DescuentosPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDiscounts)
  const [sheetState, setSheetState] = useState<{ open: boolean; discount?: DiscountCode }>({ open: false })

  function handleSave(discount: DiscountCode) {
    setDiscounts((prev) => {
      const exists = prev.some((d) => d.id === discount.id)
      return exists ? prev.map((d) => (d.id === discount.id ? discount : d)) : [discount, ...prev]
    })
  }

  function toggleActive(id: string) {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)))
    toast.success("Estado del cupón actualizado")
  }

  const columns: DataTableColumnDef<DiscountCode>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => discountTypeLabel[row.original.type],
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) =>
        row.original.type === "PERCENTAGE" ? `${row.original.value}%` : formatMoney(row.original.value),
    },
    {
      accessorKey: "scope",
      header: "Alcance",
      cell: ({ row }) =>
        row.original.scope === "ORDER" ? "Pedido" : row.original.productName ?? "Producto",
    },
    {
      id: "minSubtotal",
      header: "Subtotal mínimo",
      cell: ({ row }) => (row.original.minSubtotal ? formatMoney(row.original.minSubtotal) : "—"),
    },
    {
      id: "usage",
      header: "Usos",
      enableSorting: false,
      cell: ({ row }) => {
        const max = row.original.maxRedemptions
        const used = row.original.usedCount
        if (!max) return <span className="text-sm text-muted-foreground">{used} (sin límite)</span>
        const pct = Math.min(100, (used / max) * 100)
        return (
          <div className="w-32 space-y-1">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">
              {used} / {max}
            </p>
          </div>
        )
      },
    },
    {
      id: "validity",
      header: "Vigencia",
      cell: ({ row }) => {
        const { startsAt, endsAt } = row.original
        if (!startsAt && !endsAt) return "Sin límite"
        return `${startsAt ? formatDate(startsAt) : "—"} – ${endsAt ? formatDate(endsAt) : "—"}`
      },
    },
    {
      id: "status",
      header: "Estado",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch checked={row.original.isActive} onCheckedChange={() => toggleActive(row.original.id)} />
          <Badge variant={row.original.isActive ? "outline" : "secondary"}>
            {row.original.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      ),
    },
    {
      id: "edit",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Editar cupón"
          onClick={() => setSheetState({ open: true, discount: row.original })}
        >
          <Pencil className="size-3.5" strokeWidth={1.75} />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Descuentos"
        description="Cupones de descuento por pedido o por producto."
        actions={
          <Button onClick={() => setSheetState({ open: true })}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Nuevo cupón
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={discounts}
        emptyState={
          <EmptyState icon={Percent} title="Sin cupones" description="Crea el primer cupón de descuento." className="border-0 py-16" />
        }
      />

      <DiscountFormSheet
        open={sheetState.open}
        onOpenChange={(open) => setSheetState((s) => ({ ...s, open }))}
        discount={sheetState.discount}
        onSave={handleSave}
      />
    </div>
  )
}
