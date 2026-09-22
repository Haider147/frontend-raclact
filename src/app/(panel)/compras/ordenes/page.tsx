"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardList } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { EmptyState } from "@/components/shared/empty-state"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

import { purchaseOrders } from "@/mocks/purchasing"
import { purchaseOrderStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types"

const columns: DataTableColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "number",
    header: "Número",
    cell: ({ row }) => (
      <Link href={`/compras/ordenes/${row.original.id}`} className="font-medium hover:text-copper hover:underline">
        {row.original.number}
      </Link>
    ),
  },
  { accessorKey: "supplierName", header: "Proveedor" },
  {
    accessorKey: "issuedAt",
    header: "Fecha",
    cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.issuedAt)}</span>,
  },
  {
    accessorKey: "expectedAt",
    header: "Fecha esperada",
    cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.expectedAt)}</span>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <Money value={row.original.total} />,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <StatusBadge meta={purchaseOrderStatusMeta[row.original.status]} />,
  },
]

export default function OrdenesCompraPage() {
  const [status, setStatus] = useState<PurchaseOrderStatus | "ALL">("ALL")
  const filtered = purchaseOrders.filter((o) => status === "ALL" || o.status === status)

  return (
    <div className="space-y-6">
      <Link href="/compras" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Compras
      </Link>
      <PageHeader title="Órdenes de compra" description="Pedidos a proveedores y su estado de recepción." />
      <DataTable
        columns={columns}
        data={filtered}
        filters={
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus | "ALL")} className="w-52">
            <NativeSelectOption value="ALL">Todos los estados</NativeSelectOption>
            {Object.keys(purchaseOrderStatusMeta).map((s) => (
              <NativeSelectOption key={s} value={s}>
                {purchaseOrderStatusMeta[s as PurchaseOrderStatus].label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        }
        emptyState={<EmptyState icon={ClipboardList} title="Sin órdenes" className="border-0 py-16" />}
      />
    </div>
  )
}
