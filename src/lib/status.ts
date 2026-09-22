import {
  BadgeCheck,
  Ban,
  Beaker,
  Boxes,
  CheckCircle2,
  Clock,
  FileWarning,
  FlaskConical,
  Hourglass,
  Lock,
  Package,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  RotateCcw,
  ShieldAlert,
  ShoppingCart,
  Star,
  Truck,
  Undo2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import type {
  BatchStatus,
  DiscountType,
  InvoiceStatus,
  OrderStatus,
  PurchaseOrderStatus,
  ReviewStatus,
  Role,
  StockMovementReason,
} from "@/types"

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "leaf" | "berry"

export interface StatusMeta {
  label: string
  tone: StatusTone
  icon: LucideIcon
}

export const orderStatusMeta: Record<OrderStatus, StatusMeta> = {
  PENDING: { label: "Pendiente", tone: "warning", icon: Hourglass },
  PAID: { label: "Pagado", tone: "info", icon: CheckCircle2 },
  SHIPPED: { label: "Despachado", tone: "leaf", icon: Truck },
  DELIVERED: { label: "Entregado", tone: "success", icon: PackageCheck },
  CANCELLED: { label: "Cancelado", tone: "danger", icon: XCircle },
}

/** Orden de la línea de tiempo del pedido (creado → pagado → despachado → entregado). */
export const orderStatusTimeline: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED"]

export const stockMovementReasonMeta: Record<StockMovementReason, StatusMeta> = {
  SALE: { label: "Venta", tone: "info", icon: ShoppingCart },
  CANCELLATION: { label: "Cancelación", tone: "danger", icon: Undo2 },
  RESTOCK: { label: "Reposición", tone: "success", icon: PackagePlus },
  ADJUSTMENT: { label: "Ajuste", tone: "neutral", icon: Boxes },
  RETURN: { label: "Devolución", tone: "leaf", icon: RotateCcw },
  DAMAGE: { label: "Merma", tone: "danger", icon: FileWarning },
}

export const reviewStatusMeta: Record<ReviewStatus, StatusMeta> = {
  PENDING: { label: "Pendiente", tone: "warning", icon: Clock },
  APPROVED: { label: "Aprobada", tone: "success", icon: Star },
  REJECTED: { label: "Rechazada", tone: "danger", icon: XCircle },
}

export const batchStatusMeta: Record<BatchStatus, StatusMeta> = {
  PLANIFICADO: { label: "Planificado", tone: "neutral", icon: Clock },
  EN_PROCESO: { label: "En proceso", tone: "info", icon: FlaskConical },
  FERMENTACION: { label: "Fermentación", tone: "berry", icon: Beaker },
  ENVASADO: { label: "Envasado", tone: "info", icon: Package },
  LIBERADO: { label: "Liberado", tone: "success", icon: BadgeCheck },
  RECHAZADO: { label: "Rechazado", tone: "danger", icon: Ban },
}

export const purchaseOrderStatusMeta: Record<PurchaseOrderStatus, StatusMeta> = {
  BORRADOR: { label: "Borrador", tone: "neutral", icon: Clock },
  ENVIADA: { label: "Enviada", tone: "info", icon: Truck },
  RECIBIDA_PARCIAL: { label: "Recibida parcial", tone: "warning", icon: PackagePlus },
  RECIBIDA: { label: "Recibida", tone: "success", icon: PackageCheck },
  ANULADA: { label: "Anulada", tone: "danger", icon: XCircle },
}

export const invoiceStatusMeta: Record<InvoiceStatus, StatusMeta> = {
  EMITIDA: { label: "Emitida", tone: "info", icon: ReceiptText },
  PAGADA: { label: "Pagada", tone: "success", icon: CheckCircle2 },
  ANULADA: { label: "Anulada", tone: "danger", icon: XCircle },
}

export const roleMeta: Record<Role, StatusMeta> = {
  ADMIN: { label: "Administrador", tone: "berry", icon: ShieldAlert },
  CUSTOMER: { label: "Cliente", tone: "neutral", icon: BadgeCheck },
}

export const discountTypeLabel: Record<DiscountType, string> = {
  PERCENTAGE: "Porcentaje",
  FIXED: "Monto fijo",
}

export type AccountStatus = "ACTIVE" | "LOCKED" | "DEACTIVATED"

export const accountStatusMeta: Record<AccountStatus, StatusMeta> = {
  ACTIVE: { label: "Activo", tone: "success", icon: CheckCircle2 },
  LOCKED: { label: "Bloqueado", tone: "warning", icon: Lock },
  DEACTIVATED: { label: "Dado de baja", tone: "danger", icon: Ban },
}

export function getAccountStatus(user: {
  lockedAt: string | null
  deactivatedAt: string | null
}): AccountStatus {
  if (user.deactivatedAt) return "DEACTIVATED"
  if (user.lockedAt) return "LOCKED"
  return "ACTIVE"
}
