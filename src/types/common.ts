import type { ErrorCode } from "./enums"

/** Prisma.Decimal se serializa como string en JSON — nunca number. */
export type Money = string

/** ISO 8601. */
export type IsoDateTime = string

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface ApiErrorShape {
  error: string
  code?: ErrorCode
  details?: unknown
}
