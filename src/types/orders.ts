import type { OrderStatus } from "./enums"
import type { IsoDateTime, Money } from "./common"

export interface OrderItem {
  id: string
  orderId: string
  variantId: string
  productName: string
  variantSize: string | null
  variantColor: string | null
  sku: string
  imageUrl: string | null
  quantity: number
  unitPrice: Money
  lineTotal: Money
}

export interface OrderStatusHistoryEntry {
  id: string
  orderId: string
  status: OrderStatus
  note: string | null
  createdAt: IsoDateTime
}

export interface Order {
  id: string
  number: string
  userId: string
  status: OrderStatus

  // Congelados al momento del pedido — no se leen por relación al cliente/dirección actual.
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  shipLine1: string
  shipLine2: string | null
  shipNumber: string | null
  shipCity: string
  shipState: string | null
  shipCountry: string
  shipPostalCode: string
  shipMethodName: string | null

  subtotal: Money
  discountTotal: Money
  shippingTotal: Money
  total: Money
  currency: "COP"

  gateway: string | null
  gatewayTransactionId: string | null
  paymentMethod: string | null
  paidAt: IsoDateTime | null

  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  estimatedDelivery: IsoDateTime | null
  shippedAt: IsoDateTime | null
  deliveredAt: IsoDateTime | null

  items: OrderItem[]
  statusHistory: OrderStatusHistoryEntry[]
  createdAt: IsoDateTime
}
