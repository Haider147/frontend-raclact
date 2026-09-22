"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Package, Plus } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { Money } from "@/components/shared/money"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

import { categories, products as initialProducts } from "@/mocks/products"
import type { Product } from "@/types"

const columns = (
  onToggleActive: (id: string) => void
): DataTableColumnDef<Product>[] => [
  {
    id: "thumbnail",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Image
        src={row.original.images[0]?.url ?? "/products/kumis.svg"}
        alt={row.original.name}
        width={36}
        height={36}
        className="size-9 rounded-lg ring-1 ring-border"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <Link href={`/productos/${row.original.id}`} className="font-medium hover:text-copper hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "category",
    header: "Categoría",
    cell: ({ row }) => {
      const category = categories.find((c) => c.id === row.original.categoryId)
      return <span className="text-muted-foreground">{category?.name ?? "—"}</span>
    },
  },
  {
    accessorKey: "price",
    header: "Precio desde",
    cell: ({ row }) => <Money value={row.original.price} />,
  },
  {
    id: "variantCount",
    header: "Variantes",
    cell: ({ row }) => row.original.variants.length,
  },
  {
    id: "totalStock",
    header: "Stock total",
    cell: ({ row }) => row.original.variants.reduce((sum, v) => sum + v.stock, 0),
  },
  {
    id: "isActive",
    header: "Visible",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => onToggleActive(row.original.id)}
          aria-label={row.original.isActive ? "Desactivar producto" : "Activar producto"}
        />
        <Badge variant={row.original.isActive ? "outline" : "secondary"}>
          {row.original.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>
    ),
  },
]

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("ALL")
  const [includeInactive, setIncludeInactive] = useState(true)

  function toggleActive(id: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    )
    const product = products.find((p) => p.id === id)
    toast.success(
      product?.isActive ? `${product.name} desactivado` : `${product?.name} activado`
    )
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (!includeInactive && !p.isActive) return false
      if (categoryId !== "ALL" && p.categoryId !== categoryId) return false
      if (term && !p.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [products, search, categoryId, includeInactive])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de kumis y yogures RacLact, con sus variantes por tamaño y sabor."
        actions={
          <Button nativeButton={false} render={<Link href="/productos/nuevo" />}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Nuevo producto
          </Button>
        }
      />

      <DataTable
        columns={columns(toggleActive)}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar producto…"
        filters={
          <>
            <NativeSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-44">
              <NativeSelectOption value="ALL">Todas las categorías</NativeSelectOption>
              {categories
                .filter((c) => !c.parentId)
                .map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(v) => setIncludeInactive(!!v)}
              />
              Incluir inactivos
            </label>
          </>
        }
        emptyState={
          <EmptyState
            icon={Package}
            title="Sin productos"
            description="No hay productos que coincidan con los filtros aplicados."
            className="border-0 py-16"
          />
        }
      />
    </div>
  )
}
