// Módulo futuro — no existe en raclact-backend (ver comentario en src/types/invoicing.ts).
// La facturación electrónica colombiana exigirá CUFE, resolución DIAN vigente y un
// proveedor tecnológico habilitado — fuera de alcance de esta maqueta.

import type { CreditNote, Invoice, InvoiceStatus } from "@/types"
import { orders } from "@/mocks/orders"
import { createRng, pick } from "@/mocks/rng"

const rng = createRng(9900)

const IVA_RATE = 0.19

const invoiceableOrders = orders.filter((o) => o.paidAt).slice(0, 18)

export const invoices: Invoice[] = invoiceableOrders.map((order, i) => {
  const total = Number(order.total)
  const base = Math.round(total / (1 + IVA_RATE))
  const vat = total - base
  // El estado de la factura es independiente del pedido: una nota crédito puede
  // anular una factura ya emitida sin que el pedido en sí cambie de estado.
  const status: InvoiceStatus = pick(rng, [
    "EMITIDA",
    "PAGADA",
    "PAGADA",
    "PAGADA",
    "ANULADA",
  ] as InvoiceStatus[])

  return {
    id: `inv_${i + 1}`,
    number: `FE-${3000 + i}`,
    orderId: order.number,
    customerName: order.buyerName,
    customerNit: null,
    status,
    issuedAt: order.paidAt!,
    base: String(base),
    vat: String(vat),
    total: String(total),
    lines: order.items.map((item, li) => ({
      id: `inv_${i + 1}-line-${li + 1}`,
      invoiceId: `inv_${i + 1}`,
      description: `${item.productName}${item.variantSize ? ` · ${item.variantSize}` : ""}${item.variantColor ? ` · ${item.variantColor}` : ""}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  } satisfies Invoice
})

export const creditNotes: CreditNote[] = invoices
  .filter((inv) => inv.status === "ANULADA")
  .map((inv, i) => ({
    id: `cn_${i + 1}`,
    number: `NC-${100 + i}`,
    invoiceId: inv.id,
    invoiceNumber: inv.number,
    reason: "Pedido cancelado antes del despacho",
    total: inv.total,
    issuedAt: inv.issuedAt,
  }))
