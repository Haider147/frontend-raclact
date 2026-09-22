import type { Order, OrderItem, OrderStatus, OrderStatusHistoryEntry } from "@/types"
import { allVariants, getProductByVariantId, getVariantImageUrl } from "@/mocks/products"
import { customers } from "@/mocks/customers"
import { createRng, daysAgo, pick, randInt, weighted } from "@/mocks/rng"

const rng = createRng(2024)

const CITIES = [
  { city: "Cali", state: "Valle del Cauca" },
  { city: "Palmira", state: "Valle del Cauca" },
  { city: "Jamundí", state: "Valle del Cauca" },
  { city: "Yumbo", state: "Valle del Cauca" },
  { city: "Buga", state: "Valle del Cauca" },
]

const PAYMENT_METHODS = ["Tarjeta de crédito", "PSE", "Nequi", "Bancolombia Transfer"]
const CARRIERS = ["Interrapidísimo", "Servientrega", "Coordinadora"]
const CANCEL_REASONS = [
  "Dirección errónea",
  "El cliente cambió de decisión",
  "Producto no disponible al momento del despacho",
  "Duplicado de otro pedido",
]

const customerPool = customers.filter((c) => c.role === "CUSTOMER")

function statusForOffset(offsetDays: number): OrderStatus {
  if (offsetDays <= 1) {
    return weighted(rng, [
      ["PENDING", 5],
      ["PAID", 3],
      ["CANCELLED", 1],
    ])
  }
  if (offsetDays <= 4) {
    return weighted(rng, [
      ["PAID", 3],
      ["SHIPPED", 4],
      ["CANCELLED", 1],
    ])
  }
  if (offsetDays <= 10) {
    return weighted(rng, [
      ["SHIPPED", 3],
      ["DELIVERED", 6],
      ["CANCELLED", 1],
    ])
  }
  return weighted(rng, [
    ["DELIVERED", 9],
    ["CANCELLED", 1],
  ])
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

const ORDER_COUNT = 52
const START_NUMBER = 2401

interface Draft {
  offsetDays: number
  status: OrderStatus
}

const drafts: Draft[] = Array.from({ length: ORDER_COUNT }, () => {
  const offsetDays = randInt(rng, 0, 90)
  return { offsetDays, status: statusForOffset(offsetDays) }
}).sort((a, b) => b.offsetDays - a.offsetDays)

export const orders: Order[] = drafts.map((draft, index) => {
  const number = `RL-${START_NUMBER + index}`
  const buyer = pick(rng, customerPool)
  const loc = pick(rng, CITIES)
  const createdAt = daysAgo(rng, draft.offsetDays)

  const itemCount = randInt(rng, 1, 4)
  const chosenVariantIds = new Set<string>()
  while (chosenVariantIds.size < itemCount && chosenVariantIds.size < allVariants.length) {
    chosenVariantIds.add(pick(rng, allVariants).id)
  }

  const items: OrderItem[] = Array.from(chosenVariantIds).map((variantId, i) => {
    const variant = allVariants.find((v) => v.id === variantId)!
    const product = getProductByVariantId(variantId)!
    const quantity = randInt(rng, 1, 3)
    const unitPrice = Number(variant.price ?? product.price)
    const lineTotal = unitPrice * quantity
    return {
      id: `${number}-item-${i + 1}`,
      orderId: number,
      variantId,
      productName: product.name,
      variantSize: variant.size,
      variantColor: variant.color,
      sku: variant.sku,
      imageUrl: getVariantImageUrl(variantId),
      quantity,
      unitPrice: String(unitPrice),
      lineTotal: String(lineTotal),
    }
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0)
  const hasDiscount = rng() > 0.82
  const discountTotal = hasDiscount ? Math.round(subtotal * 0.1) : 0
  const freeShipping = subtotal - discountTotal >= 60000
  const shippingTotal = freeShipping ? 0 : 8000
  const total = subtotal - discountTotal + shippingTotal

  const statusHistory: OrderStatusHistoryEntry[] = [
    { id: `${number}-hist-1`, orderId: number, status: "PENDING", note: null, createdAt: createdAt.toISOString() },
  ]

  let paidAt: string | null = null
  let shippedAt: string | null = null
  let deliveredAt: string | null = null
  let carrier: string | null = null
  let trackingNumber: string | null = null
  let trackingUrl: string | null = null
  let estimatedDelivery: string | null = null

  if (draft.status === "CANCELLED") {
    // Regla de negocio: solo se cancela desde PENDING, nunca tras pagar.
    const cancelledDate = addHours(createdAt, randInt(rng, 1, 20))
    statusHistory.push({
      id: `${number}-hist-2`,
      orderId: number,
      status: "CANCELLED",
      note: pick(rng, CANCEL_REASONS),
      createdAt: cancelledDate.toISOString(),
    })
  } else if (draft.status !== "PENDING") {
    const paidDate = addHours(createdAt, randInt(rng, 1, 6))
    paidAt = paidDate.toISOString()
    statusHistory.push({ id: `${number}-hist-2`, orderId: number, status: "PAID", note: null, createdAt: paidAt })
  }

  if (draft.status === "SHIPPED" || draft.status === "DELIVERED") {
    const shippedDate = addHours(new Date(paidAt!), randInt(rng, 12, 48))
    shippedAt = shippedDate.toISOString()
    carrier = pick(rng, CARRIERS)
    trackingNumber = String(randInt(rng, 80000000, 99999999))
    trackingUrl = `https://rastreo.${carrier.toLowerCase().replace(/[íó]/g, (m) => (m === "í" ? "i" : "o"))}.co/${trackingNumber}`
    estimatedDelivery = addHours(shippedDate, 72).toISOString()
    statusHistory.push({
      id: `${number}-hist-3`,
      orderId: number,
      status: "SHIPPED",
      note: `${carrier} · guía ${trackingNumber}`,
      createdAt: shippedAt,
    })
  }

  if (draft.status === "DELIVERED") {
    const deliveredDate = addHours(new Date(shippedAt!), randInt(rng, 24, 96))
    deliveredAt = deliveredDate.toISOString()
    statusHistory.push({
      id: `${number}-hist-4`,
      orderId: number,
      status: "DELIVERED",
      note: null,
      createdAt: deliveredAt,
    })
  }

  return {
    id: number,
    number,
    userId: buyer.id,
    status: draft.status,

    buyerName: buyer.name,
    buyerEmail: buyer.email,
    buyerPhone: buyer.phone,
    shipLine1: `${pick(rng, ["Calle", "Carrera", "Avenida"])} ${randInt(rng, 1, 130)} # ${randInt(rng, 1, 99)}-${randInt(rng, 1, 99)}`,
    shipLine2: rng() > 0.6 ? `Apto ${randInt(rng, 101, 1204)}` : null,
    shipNumber: null,
    shipCity: loc.city,
    shipState: loc.state,
    shipCountry: "Colombia",
    shipPostalCode: `76${randInt(rng, 100, 999)}`,
    shipMethodName: freeShipping ? "Envío gratis" : "Envío estándar",

    subtotal: String(subtotal),
    discountTotal: String(discountTotal),
    shippingTotal: String(shippingTotal),
    total: String(total),
    currency: "COP",

    gateway: paidAt ? "Wompi" : null,
    gatewayTransactionId: paidAt ? `wmp_${number.toLowerCase()}_${randInt(rng, 1000, 9999)}` : null,
    paymentMethod: paidAt ? pick(rng, PAYMENT_METHODS) : null,
    paidAt,

    carrier,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    shippedAt,
    deliveredAt,

    items,
    statusHistory,
    createdAt: createdAt.toISOString(),
  } satisfies Order
})

export function getOrderByNumber(number: string): Order | undefined {
  return orders.find((o) => o.number === number)
}

export const recentOrders = [...orders]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 8)
