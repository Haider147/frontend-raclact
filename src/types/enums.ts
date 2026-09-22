// Enums calcados 1:1 del backend (raclact-backend). Ver CLAUDE.md del backend,
// sección "Enums y modelos" del contrato de la API.

export type Role = "CUSTOMER" | "ADMIN"

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"

export type StockMovementReason =
  | "SALE"
  | "CANCELLATION"
  | "RESTOCK"
  | "ADJUSTMENT"
  | "RETURN"
  | "DAMAGE"

/** Motivos que puede elegir un admin en el ajuste manual de stock (SALE y CANCELLATION los escribe solo el flujo de pedidos). */
export type ManualStockMovementReason = Extract<
  StockMovementReason,
  "RESTOCK" | "ADJUSTMENT" | "RETURN" | "DAMAGE"
>

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED"

export type DiscountType = "PERCENTAGE" | "FIXED"

export type DiscountScope = "ORDER" | "PRODUCT"

export type FilePurpose = "PRODUCT_IMAGE" | "CATEGORY_IMAGE" | "USER_AVATAR"

export type FileVisibility = "PUBLIC" | "PRIVATE"

// El backend ya soporta ENVIA (tarifa cotizada, ver CLAUDE.md de raclact-backend),
// pero esta maqueta solo usa métodos MANUAL (sección 5.13 del brief).
export type ShippingProvider = "MANUAL" | "ENVIA"

export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_PAID"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "OUT_OF_STOCK"
  | "PRODUCT_UNAVAILABLE"
  | "INVALID_STATUS_TRANSITION"
  | "SHIPPING_METHOD_IN_USE"
  | "FILE_IN_USE"
  | "CANNOT_MODIFY_SELF"
  | "ACCOUNT_DEACTIVATED"
  | "DISCOUNT_CODE_INVALID"
  | "DISCOUNT_CODE_EXPIRED"
  | "DISCOUNT_CODE_EXHAUSTED"
  | "INTERNAL_ERROR"

// --- Módulos futuros: aún no existen en raclact-backend. Formalizarlos exigirá
// ampliar schema.prisma (nuevos modelos) y el enum Role (p. ej. PRODUCTION, PURCHASING). ---

export type BatchStatus =
  | "PLANIFICADO"
  | "EN_PROCESO"
  | "FERMENTACION"
  | "ENVASADO"
  | "LIBERADO"
  | "RECHAZADO"

export type BatchRoute = "YOGUR" | "KUMIS"

export type PurchaseOrderStatus =
  | "BORRADOR"
  | "ENVIADA"
  | "RECIBIDA_PARCIAL"
  | "RECIBIDA"
  | "ANULADA"

export type InvoiceStatus = "EMITIDA" | "PAGADA" | "ANULADA"
