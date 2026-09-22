"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { isWithinInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ReceiptText } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

import { invoices } from "@/mocks/invoicing"
import { invoiceStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { Invoice } from "@/types"

const columns: DataTableColumnDef<Invoice>[] = [
  {
    accessorKey: "number",
    header: "Número",
    cell: ({ row }) => (
      <Link href={`/facturacion/${row.original.id}`} className="font-medium hover:text-copper hover:underline">
        {row.original.number}
      </Link>
    ),
  },
  { accessorKey: "customerName", header: "Cliente" },
  {
    accessorKey: "issuedAt",
    header: "Fecha de emisión",
    cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.issuedAt)}</span>,
  },
  { accessorKey: "base", header: "Base", cell: ({ row }) => <Money value={row.original.base} /> },
  { accessorKey: "vat", header: "IVA", cell: ({ row }) => <Money value={row.original.vat} /> },
  { accessorKey: "total", header: "Total", cell: ({ row }) => <Money value={row.original.total} /> },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <StatusBadge meta={invoiceStatusMeta[row.original.status]} />,
  },
]

export default function FacturacionPage() {
  const [search, setSearch] = useState("")
  const [range, setRange] = useState<DateRange | undefined>(undefined)

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (search && !inv.customerName.toLowerCase().includes(search.toLowerCase())) return false
      if (range?.from && range?.to && !isWithinInterval(new Date(inv.issuedAt), { start: range.from, end: range.to })) return false
      return true
    })
  }, [search, range])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturación"
        description="Facturas emitidas a partir de pedidos pagados."
        actions={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/facturacion/notas-credito" />}>
            Notas crédito
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar cliente…"
        filters={<DateRangePicker value={range} onChange={setRange} />}
        emptyState={<EmptyState icon={ReceiptText} title="Sin facturas" className="border-0 py-16" />}
      />

      <p className="text-xs text-muted-foreground">
        La facturación electrónica colombiana exigirá CUFE, resolución DIAN vigente y un proveedor tecnológico
        habilitado — fuera de alcance de esta maqueta.
      </p>
    </div>
  )
}
