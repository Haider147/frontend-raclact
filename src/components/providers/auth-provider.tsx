"use client"

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react"
import { ApiError, loginRequest, logoutRequest } from "@/lib/api"
import {
  PANEL_ROLES,
  clearSession,
  getServerSession,
  getSession,
  setSession,
  subscribeSession,
  type SessionUser,
} from "@/lib/session"

interface AuthContextValue {
  user: SessionUser | null
  login: (email: string, password: string) => Promise<SessionUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function login(email: string, password: string): Promise<SessionUser> {
  const result = await loginRequest(email, password)
  if (!PANEL_ROLES.includes(result.user.role)) {
    // El backend acepta al cliente, pero el panel no es para él: se cierra la
    // sesión recién abierta para no dejar un refresh token vivo.
    await logoutRequest(result.refreshToken).catch(() => undefined)
    throw new ApiError(403, "FORBIDDEN", "Tu cuenta no tiene acceso al panel")
  }
  setSession(result)
  return result.user
}

async function logout(): Promise<void> {
  const session = getSession()
  clearSession()
  // Si falla, el token caduca solo; localmente la sesión ya se cerró.
  if (session) await logoutRequest(session.refreshToken).catch(() => undefined)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSession)
  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>.")
  return context
}
