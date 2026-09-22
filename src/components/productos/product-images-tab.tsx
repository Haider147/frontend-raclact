"use client"

import Image from "next/image"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import type { ProductImage } from "@/types"

const PLACEHOLDER_POOL = [
  "/products/kumis.svg",
  "/products/yogur-fresa.svg",
  "/products/yogur-melocoton.svg",
  "/products/yogur-mora.svg",
]

export function ProductImagesTab({
  images,
  productId,
  onChange,
}: {
  images: ProductImage[]
  productId: string
  onChange: (images: ProductImage[]) => void
}) {
  function move(index: number, dir: -1 | 1) {
    const next = [...images]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next.map((img, i) => ({ ...img, position: i + 1 })))
  }

  function addImage() {
    const url = PLACEHOLDER_POOL[images.length % PLACEHOLDER_POOL.length]
    onChange([
      ...images,
      {
        id: `img_new_${Date.now()}`,
        productId,
        fileId: `file_new_${Date.now()}`,
        url,
        alt: "Nueva imagen de producto",
        position: images.length + 1,
      },
    ])
    toast.success("Imagen agregada desde la mediateca (simulado)")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={addImage}>
            <ImagePlus className="size-3.5" strokeWidth={1.75} />
            Agregar desde mediateca
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <EmptyState
            icon={ImagePlus}
            title="Sin imágenes"
            description="Agrega al menos una imagen para mostrar el producto."
            className="border-0 py-14"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image, i) => (
              <div key={image.id} className="space-y-2 rounded-xl border border-border p-3">
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={160}
                  height={160}
                  className="aspect-square w-full rounded-lg object-cover ring-1 ring-border"
                />
                <Input
                  value={image.alt}
                  onChange={(e) =>
                    onChange(images.map((img) => (img.id === image.id ? { ...img, alt: e.target.value } : img)))
                  }
                  placeholder="Texto alternativo"
                  className="text-xs"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" aria-label="Mover antes" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowLeft className="size-3.5" strokeWidth={1.75} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Mover después"
                      disabled={i === images.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowRight className="size-3.5" strokeWidth={1.75} />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Quitar imagen"
                    onClick={() => onChange(images.filter((img) => img.id !== image.id))}
                  >
                    <Trash2 className="size-3.5 text-danger" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
