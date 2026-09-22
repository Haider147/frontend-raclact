import type { NotificationType } from "./enums"
import type { IsoDateTime } from "./common"

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  href: string | null
  readAt: IsoDateTime | null
  createdAt: IsoDateTime
}
