// Sesión del panel: el par de tokens y el usuario que devuelve POST /auth/login,
// guardados en localStorage y expuestos como store para useSyncExternalStore.

/** Enum Role de raclact-backend (prisma/schema.prisma). */
export type Role = "CUSTOMER" | "ADMIN" | "PRODUCTION"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}

/** Respuesta de /auth/login y /auth/refresh. */
export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: SessionUser
}

export type Session = AuthResult

/** Roles que pueden entrar al panel. CUSTOMER es de la tienda, no del panel. */
export const PANEL_ROLES: Role[] = ["ADMIN", "PRODUCTION"]

export const roleLabels: Record<Role, string> = {
  CUSTOMER: "Cliente",
  ADMIN: "Administrador",
  PRODUCTION: "Producción",
}

const STORAGE_KEY = "raclact_session"

let cached: Session | null | undefined
const listeners = new Set<() => void>()

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function write(next: Session | null): void {
  cached = next
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage no disponible (modo privado, etc.) — la sesión sigue en memoria.
  }
  listeners.forEach((listener) => listener())
}

export function getSession(): Session | null {
  if (cached === undefined) cached = read()
  return cached
}

export function getServerSession(): Session | null {
  return null
}

export function setSession(session: Session): void {
  write(session)
}

export function clearSession(): void {
  write(null)
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
