"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductForm } from "@/components/productos/product-form"
import { products } from "@/mocks/products"
import type { Product } from "@/types"

export default function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => setProduct(products.find((p) => p.id === id) ?? null), 500)
    return () => clearTimeout(timer)
  }, [id])

  if (product === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (product === null) {
    return <ErrorState title="Producto no encontrado" description={`No existe ningún producto con el id "${id}".`} />
  }

  return <ProductForm product={product} />
}
