import type { StockMovement, StockMovementReason } from "@/types"
import { allVariants, variantStock } from "@/mocks/products"
import { orders } from "@/mocks/orders"
import { customers } from "@/mocks/customers"
import { createRng, daysAgo, pick, randInt } from "@/mocks/rng"

const rng = createRng(3033)
const admins = customers.filter((c) => c.role === "ADMIN")

interface RawEvent {
  date: string
  reason: StockMovementReason
  quantity: number
  note: string | null
  byAdmin: boolean
}

function manualEvents(): RawEvent[] {
  const count = randInt(rng, 3, 6)
  return Array.from({ length: count }, () => {
    const reason = pick(rng, [
      "RESTOCK", "RESTOCK", "ADJUSTMENT", "RETURN", "DAMAGE",
    ] as StockMovementReason[])
    const date = daysAgo(rng, randInt(rng, 1, 85)).toISOString()
    switch (reason) {
      case "RESTOCK":
        return { date, reason, quantity: randInt(rng, 120, 420), note: "Ingreso de producción a bodega", byAdmin: true }
      case "RETURN":
        return { date, reason, quantity: randInt(rng, 1, 6), note: "Devolución de cliente en buen estado", byAdmin: true }
      case "DAMAGE":
        return { date, reason, quantity: -randInt(rng, 1, 12), note: "Envases dañados en bodega", byAdmin: true }
      default:
        return { date, reason: "ADJUSTMENT" as const, quantity: randInt(rng, -15, 15) || 3, note: "Ajuste por conteo físico", byAdmin: true }
    }
  })
}

function saleEvents(variantId: string): RawEvent[] {
  return orders
    .filter((o) => o.paidAt)
    .flatMap((o) =>
      o.items
        .filter((item) => item.variantId === variantId)
        .map((item) => ({
          date: o.paidAt!,
          reason: "SALE" as const,
          quantity: -item.quantity,
          note: `Pedido ${o.number}`,
          byAdmin: false,
        }))
    )
}

function buildLedger(variantId: string): StockMovement[] {
  const events = [...manualEvents(), ...saleEvents(variantId)].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const openingDate = daysAgo(rng, 92)
  const openingQty = randInt(rng, 250, 500)
  const target = variantStock[variantId] ?? 0

  let running = 0
  const movements: StockMovement[] = []

  function push(reason: StockMovementReason, quantity: number, note: string | null, date: string, byAdmin: boolean) {
    running += quantity
    const admin = byAdmin ? pick(rng, admins) : null
    movements.push({
      id: `mv_${variantId}_${movements.length + 1}`,
      variantId,
      reason,
      quantity,
      balanceAfter: running,
      note,
      createdById: admin?.id ?? null,
      createdByName: admin?.name ?? null,
      createdAt: date,
    })
  }

  push("RESTOCK", openingQty, "Apertura de kardex", openingDate.toISOString(), true)
  for (const event of events) {
    push(event.reason, event.quantity, event.note, event.date, event.byAdmin)
  }

  const diff = target - running
  if (diff !== 0) {
    push(
      "ADJUSTMENT",
      diff,
      "Cuadre de inventario contra conteo físico",
      daysAgo(rng, randInt(rng, 0, 1)).toISOString(),
      true
    )
  }

  return movements
}

export const stockMovements: StockMovement[] = allVariants.flatMap((variant) => buildLedger(variant.id))

export function getMovementsByVariant(variantId: string): StockMovement[] {
  return stockMovements
    .filter((m) => m.variantId === variantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const recentMovements = [...stockMovements]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 40)
