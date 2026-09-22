import type { Role } from "./enums"
import type { IsoDateTime } from "./common"

export interface Address {
  id: string
  userId: string
  label: string | null
  line1: string
  line2: string | null
  number: string | null
  city: string
  state: string | null
  country: string
  postalCode: string
  isDefault: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  emailVerifiedAt: IsoDateTime | null
  /** Bloqueo por intentos fallidos de acceso — POST /users/:id/unlock lo limpia. */
  lockedAt: IsoDateTime | null
  /** Baja lógica — nunca DELETE. */
  deactivatedAt: IsoDateTime | null
  avatarUrl: string | null
  createdAt: IsoDateTime
}

export interface ActivityLogEntry {
  id: string
  userId: string
  label: string
  detail: string | null
  createdAt: IsoDateTime
}
