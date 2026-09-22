// Módulo futuro — no existe en raclact-backend. Formalizarlo exigirá modelos nuevos
// en schema.prisma (Supplier, PurchaseOrder, PurchaseOrderLine, RawMaterial)
// y ampliar el enum Role (p. ej. sumar PURCHASING).

import type { PurchaseOrderStatus } from "./enums"
import type { IsoDateTime, Money } from "./common"

export interface Supplier {
  id: string
  name: string
  nit: string
  contactName: string
  contactPhone: string
  contactEmail: string
  suppliesInputs: string[]
  leadTimeDays: number
  isActive: boolean
}

export interface RawMaterial {
  id: string
  name: string
  unit: string
  stock: number
  reorderPoint: number
}

export interface PurchaseOrderLine {
  id: string
  purchaseOrderId: string
  rawMaterialId: string
  rawMaterialName: string
  quantityOrdered: number
  quantityReceived: number
  unitCost: Money
}

export interface PurchaseOrder {
  id: string
  number: string
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  issuedAt: IsoDateTime
  expectedAt: IsoDateTime
  total: Money
  lines: PurchaseOrderLine[]
}
