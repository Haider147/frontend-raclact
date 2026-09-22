"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { DateRange } from "react-day-picker"
import { isWithinInterval } from "date-fns"
import { ClipboardList } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { EmptyState } from "@/components/shared/empty-state"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"

import { orders } from "@/mocks/orders"
import { orderStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { Order, OrderStatus } from "@/types"

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "SHIPPED", label: "Despachado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
]

const columns: DataTableColumnDef<Order>[] = [
  {
    accessorKey: "number",
    header: "Número",
    cell: ({ row }) => (
      <Link href={`/pedidos/${row.original.id}`} className="font-medium hover:text-copper hover:underline">
        {row.original.number}
      </Link>
    ),
  },
  {
    accessorKey: "buyerName",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="max-w-48">
        <p className="truncate font-medium text-foreground">{row.original.buyerName}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.buyerEmail}</p>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <StatusBadge meta={orderStatusMeta[row.original.status]} />,
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => row.original.items.reduce((sum, i) => sum + i.quantity, 0),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <Money value={row.original.total} />,
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de pago",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.paymentMethod ?? "—"}</span>
    ),
  },
]

export default function PedidosPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (status !== "ALL" && order.status !== status) return false
      if (
        term &&
        !order.number.toLowerCase().includes(term) &&
        !order.buyerEmail.toLowerCase().includes(term)
      ) {
        return false
      }
      if (range?.from && range?.to) {
        if (!isWithinInterval(new Date(order.createdAt), { start: range.from, end: range.to })) return false
      }
      return true
    })
  }, [search, status, range])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [filtered]
  )

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Todos los pedidos de la tienda, con su estado de pago y despacho."
      />

      <DataTable
        columns={columns}
        data={paged}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Buscar por número o correo…"
        filters={
          <>
            <NativeSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatus | "ALL")
                setPage(1)
              }}
              className="w-44"
            >
              {STATUS_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <DateRangePicker
              value={range}
              onChange={(r) => {
                setRange(r)
                setPage(1)
              }}
            />
          </>
        }
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="Sin pedidos"
            description="No hay pedidos que coincidan con los filtros aplicados."
            className="border-0 py-16"
          />
        }
        pagination={{
          page,
          pageSize,
          total: sorted.length,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setPage(1)
          },
        }}
      />
    </div>
  )
}
