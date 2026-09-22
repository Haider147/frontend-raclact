"use client"

import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductVariant } from "@/types"

export function ProductVariantsTab({
  variants,
  onChange,
}: {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
}) {
  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  function addVariant() {
    const id = `var_new_${Date.now()}`
    onChange([
      ...variants,
      {
        id,
        productId: variants[0]?.productId ?? "",
        sku: "",
        size: "1 L",
        color: null,
        stock: 0,
        price: null,
        weightGrams: null,
        lengthCm: null,
        widthCm: null,
        heightCm: null,
      },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variantes</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={addVariant}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Agregar variante
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Sabor</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Precio propio</TableHead>
              <TableHead>Peso (g)</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <Input
                    value={variant.sku}
                    onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={variant.size ?? ""}
                    onChange={(e) => updateVariant(variant.id, { size: e.target.value || null })}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={variant.color ?? ""}
                    placeholder="—"
                    onChange={(e) => updateVariant(variant.id, { color: e.target.value || null })}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/inventario/${variant.id}`}
                    className="text-sm text-muted-foreground hover:text-copper hover:underline"
                    title="El stock se mueve desde Inventario"
                  >
                    {variant.stock} u.
                  </Link>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={variant.price ?? ""}
                    placeholder="Precio del producto"
                    onChange={(e) => updateVariant(variant.id, { price: e.target.value || null })}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={variant.weightGrams ?? ""}
                    onChange={(e) =>
                      updateVariant(variant.id, { weightGrams: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Quitar variante"
                    onClick={() => onChange(variants.filter((v) => v.id !== variant.id))}
                  >
                    <Trash2 className="size-3.5 text-danger" strokeWidth={1.75} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="px-4 pt-3 text-xs text-muted-foreground">
          El stock es de solo lectura aquí — se ajusta desde el módulo de Inventario.
        </p>
      </CardContent>
    </Card>
  )
}
