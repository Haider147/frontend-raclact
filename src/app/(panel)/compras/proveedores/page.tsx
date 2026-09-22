"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Truck } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"

import { suppliers } from "@/mocks/purchasing"
import type { Supplier } from "@/types"

const columns: DataTableColumnDef<Supplier>[] = [
  { accessorKey: "name", header: "Proveedor" },
  { accessorKey: "nit", header: "NIT" },
  {
    id: "contact",
    header: "Contacto",
    cell: ({ row }) => (
      <div>
        <p>{row.original.contactName}</p>
        <p className="text-xs text-muted-foreground">{row.original.contactEmail}</p>
      </div>
    ),
  },
  {
    id: "inputs",
    header: "Insumos",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex max-w-56 flex-wrap gap-1">
        {row.original.suppliesInputs.map((input) => (
          <Badge key={input} variant="outline" className="text-[10px]">
            {input}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "leadTimeDays",
    header: "Plazo",
    cell: ({ row }) => `${row.original.leadTimeDays} día(s)`,
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "outline" : "secondary"}>
        {row.original.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
]

export default function ProveedoresPage() {
  const [search, setSearch] = useState("")
  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <Link href="/compras" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Compras
      </Link>
      <PageHeader title="Proveedores" description="Contactos y condiciones de abastecimiento." />
      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar proveedor…"
        emptyState={<EmptyState icon={Truck} title="Sin proveedores" className="border-0 py-16" />}
      />
    </div>
  )
}
