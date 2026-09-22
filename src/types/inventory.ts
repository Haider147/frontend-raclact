import type { StockMovementReason } from "./enums"
import type { IsoDateTime } from "./common"

export interface StockMovement {
  id: string
  variantId: string
  reason: StockMovementReason
  /** Con signo: positiva entra, negativa sale. */
  quantity: number
  /** Sale del RETURNING del propio UPDATE, no de una relectura posterior. */
  balanceAfter: number
  note: string | null
  createdById: string | null
  createdByName: string | null
  createdAt: IsoDateTime
}
