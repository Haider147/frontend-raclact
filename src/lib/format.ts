import { format as formatDateFns } from "date-fns"
import { es } from "date-fns/locale"

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("es-CO")

/**
 * Formatea un monto en COP: "$ 12.450". Acepta el string decimal que manda
 * el backend (Prisma.Decimal serializado) o un number para los mocks.
 * Nunca opera en coma flotante más allá de lo necesario para pintarlo.
 */
export function formatMoney(value: string | number): string {
  const numeric = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(numeric)) return copFormatter.format(0)
  return copFormatter.format(Math.round(numeric))
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** "21 sep 2026" */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return formatDateFns(date, "d MMM yyyy", { locale: es })
}

/** "21/09/2026 14:30" */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return formatDateFns(date, "dd/MM/yyyy HH:mm", { locale: es })
}

/** "hace 3 días" — para líneas de tiempo y actividad reciente. */
export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" })
  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, "day")
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, "hour")
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  return rtf.format(diffMinutes, "minute")
}
