"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { ProductGeneralTab } from "@/components/productos/product-general-tab"
import { ProductVariantsTab } from "@/components/productos/product-variants-tab"
import { ProductImagesTab } from "@/components/productos/product-images-tab"
import { ProductReviewsTab } from "@/components/productos/product-reviews-tab"
import { reviews as allReviews } from "@/mocks/reviews"
import { orders } from "@/mocks/orders"
import type { Product } from "@/types"

const EMPTY_PRODUCT: Product = {
  id: `prod_new_${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  price: "0",
  currency: "COP",
  isActive: true,
  categoryId: null,
  images: [],
  variants: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isNew = !product
  const [draft, setDraft] = useState<Product>(product ?? EMPTY_PRODUCT)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const hasSales = !isNew && orders.some((o) => o.items.some((i) => i.productName === draft.name))
  const productReviews = allReviews.filter((r) => r.productId === draft.id)

  function save() {
    toast.success(isNew ? `Producto "${draft.name}" creado` : `Cambios guardados en "${draft.name}"`)
    router.push("/productos")
  }

  function requestDelete() {
    setDeleteOpen(true)
  }

  function confirmDelete() {
    if (hasSales) {
      setDraft((d) => ({ ...d, isActive: false }))
      toast.success(`"${draft.name}" se desactivó — tiene ventas asociadas`)
    } else {
      toast.success(`"${draft.name}" eliminado`)
    }
    setDeleteOpen(false)
    router.push("/productos")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "Nuevo producto" : draft.name || "Producto"}
        description={isNew ? "Completa la información y las variantes del producto." : `Editando /${draft.slug}`}
        actions={
          <div className="flex items-center gap-2">
            {!isNew ? (
              <Button variant="destructive" size="sm" onClick={requestDelete}>
                <Trash2 className="size-3.5" strokeWidth={1.75} />
                Eliminar
              </Button>
            ) : null}
            <Button onClick={save} disabled={!draft.name.trim()}>
              {isNew ? "Crear producto" : "Guardar cambios"}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="variantes">Variantes ({draft.variants.length})</TabsTrigger>
          <TabsTrigger value="imagenes">Imágenes ({draft.images.length})</TabsTrigger>
          <TabsTrigger value="resenas" disabled={isNew}>
            Reseñas ({productReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <ProductGeneralTab draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
        </TabsContent>
        <TabsContent value="variantes">
          <ProductVariantsTab
            variants={draft.variants}
            onChange={(variants) => setDraft((d) => ({ ...d, variants }))}
          />
        </TabsContent>
        <TabsContent value="imagenes">
          <ProductImagesTab
            images={draft.images}
            productId={draft.id}
            onChange={(images) => setDraft((d) => ({ ...d, images }))}
          />
        </TabsContent>
        <TabsContent value="resenas">
          <ProductReviewsTab reviews={productReviews} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{hasSales ? "Este producto tiene ventas" : `¿Eliminar "${draft.name}"?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {hasSales
                ? "No se puede borrar un producto con pedidos asociados — se desactivará en su lugar y dejará de mostrarse en la tienda."
                : "Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete}>
              {hasSales ? "Desactivar producto" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
