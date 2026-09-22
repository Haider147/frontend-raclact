import type { FilePurpose, FileVisibility } from "./enums"
import type { IsoDateTime, Money } from "./common"

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  position: number
}

export interface ProductImage {
  id: string
  productId: string
  fileId: string
  url: string
  alt: string
  position: number
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  /** En RacLact, la presentación: '1 L' | '250 ml'. */
  size: string | null
  /** En RacLact, el sabor: 'Fresa' | 'Melocotón' | 'Mora' | null (kumis tradicional). */
  color: string | null
  /** Solo lectura en la UI: el stock se mueve desde Inventario (kardex), nunca aquí. */
  stock: number
  price: Money | null
  weightGrams: number | null
  lengthCm: number | null
  widthCm: number | null
  heightCm: number | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: Money
  currency: "COP"
  isActive: boolean
  categoryId: string | null
  images: ProductImage[]
  variants: ProductVariant[]
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface MediaFile {
  id: string
  key: string
  bucket: string
  purpose: FilePurpose
  visibility: FileVisibility
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  originalName: string | null
  publicUrl: string | null
  uploadedById: string | null
  softDeletedAt: IsoDateTime | null
  createdAt: IsoDateTime
}
