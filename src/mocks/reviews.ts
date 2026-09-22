import type { Review } from "@/types"
import { products } from "@/mocks/products"
import { orders } from "@/mocks/orders"
import { customers } from "@/mocks/customers"
import { createRng, daysAgo, pick, randInt, weighted } from "@/mocks/rng"

const rng = createRng(4045)
const customerPool = customers.filter((c) => c.role === "CUSTOMER")

const TITLES_POSITIVE = [
  "Excelente sabor", "Como el de antes", "Muy fresco", "Mi favorito de la semana",
  "Se nota la calidad", "Perfecto para el desayuno", "Repito seguro",
]
const TITLES_NEUTRAL = ["Está bien", "Cumple", "Buena opción"]
const TITLES_NEGATIVE = ["Llegó muy líquido", "No es lo que esperaba", "Muy ácido para mi gusto"]

const COMMENTS_POSITIVE = [
  "El sabor es muy natural, se nota que no tiene tanto azúcar como otras marcas.",
  "La textura es cremosa y el empaque llegó impecable. Lo volveré a pedir.",
  "Me encanta que sea de una empresa local del Valle. Muy buen producto.",
  "Ideal para las onces de los niños, no está empalagoso.",
  "Excelente relación calidad-precio, superó mis expectativas.",
]
const COMMENTS_NEUTRAL = [
  "Buen producto en general, aunque esperaba un poco más de fruta.",
  "Cumple lo que promete, nada que reclamar.",
]
const COMMENTS_NEGATIVE = [
  "La presentación de 250 ml llegó con poco producto, esperaba más.",
  "Un poco más ácido de lo que recordaba, aunque el sabor de fondo es bueno.",
  "El envío tardó más de lo esperado y llegó a temperatura ambiente.",
]

const MODERATION_NOTES = [
  "Comentario genérico, no aporta detalle del producto.",
  "Posible confusión con otro pedido — se solicitó aclaración al cliente.",
  "Lenguaje inapropiado en una versión anterior del comentario.",
]

function contentFor(rating: number) {
  if (rating >= 4) return { title: pick(rng, TITLES_POSITIVE), comment: pick(rng, COMMENTS_POSITIVE) }
  if (rating === 3) return { title: pick(rng, TITLES_NEUTRAL), comment: pick(rng, COMMENTS_NEUTRAL) }
  return { title: pick(rng, TITLES_NEGATIVE), comment: pick(rng, COMMENTS_NEGATIVE) }
}

const deliveredOrders = orders.filter((o) => o.status === "DELIVERED")

export const reviews: Review[] = Array.from({ length: 34 }, (_, i) => {
  const product = pick(rng, products)
  const author = pick(rng, customerPool)
  const rating = weighted(rng, [
    [5, 10], [4, 6], [3, 2], [2, 1], [1, 1],
  ] as [1 | 2 | 3 | 4 | 5, number][])
  const status = weighted(rng, [
    ["APPROVED", 7],
    ["PENDING", 4],
    ["REJECTED", 1],
  ] as const)
  const { title, comment } = contentFor(rating)
  const relatedOrder = deliveredOrders.find((o) =>
    o.items.some((item) => item.productName === product.name)
  )

  return {
    id: `rev_${i + 1}`,
    productId: product.id,
    productName: product.name,
    userId: author.id,
    authorName: author.name,
    orderId: relatedOrder?.number ?? null,
    rating,
    title,
    comment,
    status,
    moderationNote: status === "REJECTED" ? pick(rng, MODERATION_NOTES) : null,
    createdAt: daysAgo(rng, randInt(rng, 0, 75)).toISOString(),
  } satisfies Review
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export function averageRatingFor(productId: string): number | null {
  const approved = reviews.filter((r) => r.productId === productId && r.status === "APPROVED")
  if (approved.length === 0) return null
  return approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
}

export const pendingReviews = reviews.filter((r) => r.status === "PENDING")
