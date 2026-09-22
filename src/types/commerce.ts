import type { DiscountScope, DiscountType, ReviewStatus, ShippingProvider } from "./enums"
import type { IsoDateTime, Money } from "./common"

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  /** Porcentaje (0-100) o monto fijo en COP según `type`. */
  value: string
  scope: DiscountScope
  productId: string | null
  productName: string | null
  minSubtotal: Money | null
  maxRedemptions: number | null
  maxRedemptionsPerUser: number
  usedCount: number
  startsAt: IsoDateTime | null
  endsAt: IsoDateTime | null
  isActive: boolean
}

export interface ShippingMethod {
  id: string
  name: string
  description: string | null
  provider: ShippingProvider
  /** Con provider ENVIA no es la tarifa real, solo el respaldo. Todos los métodos mockeados son MANUAL. */
  price: Money
  currency: "COP"
  freeOverAmount: Money | null
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
  isActive: boolean
  position: number
}

export interface Review {
  id: string
  productId: string
  productName: string
  userId: string
  authorName: string
  orderId: string | null
  rating: 1 | 2 | 3 | 4 | 5
  title: string | null
  comment: string | null
  status: ReviewStatus
  moderationNote: string | null
  createdAt: IsoDateTime
}
