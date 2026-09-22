import type { AppNotification } from "@/types"

export const notifications: AppNotification[] = [
  {
    id: "not_1",
    userId: "usr_admin_1",
    type: "ORDER_CREATED",
    title: "Nuevo pedido",
    body: "El pedido RL-2451 de Laura Gómez está pendiente de pago.",
    href: "/pedidos",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "not_2",
    userId: "usr_admin_1",
    type: "ORDER_PAID",
    title: "Pago confirmado",
    body: "El pedido RL-2448 de Andrés Zapata fue pagado por Wompi.",
    href: "/pedidos",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "not_3",
    userId: "usr_admin_1",
    type: "ORDER_SHIPPED",
    title: "Pedido despachado",
    body: "RL-2440 salió con Interrapidísimo, guía 88452201.",
    href: "/pedidos",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "not_4",
    userId: "usr_admin_1",
    type: "ORDER_CANCELLED",
    title: "Pedido cancelado",
    body: "RL-2431 se canceló: \"dirección errónea\".",
    href: "/pedidos",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 41).toISOString(),
  },
]
