// Módulo futuro — no existe en raclact-backend. Formalizarlo exigirá modelos nuevos
// en schema.prisma (Invoice, InvoiceLine, CreditNote) y ampliar el enum Role.
// La facturación electrónica colombiana exigirá además CUFE, resolución DIAN vigente
// y un proveedor tecnológico habilitado — fuera de alcance de esta maqueta, solo se
// deja el lugar en la interfaz (ver /facturacion).

import type { InvoiceStatus } from "./enums"
import type { IsoDateTime, Money } from "./common"

export interface InvoiceLine {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: Money
  lineTotal: Money
}

export interface Invoice {
  id: string
  number: string
  orderId: string | null
  customerName: string
  customerNit: string | null
  status: InvoiceStatus
  issuedAt: IsoDateTime
  base: Money
  vat: Money
  total: Money
  lines: InvoiceLine[]
}

export interface CreditNote {
  id: string
  number: string
  invoiceId: string
  invoiceNumber: string
  reason: string
  total: Money
  issuedAt: IsoDateTime
}
