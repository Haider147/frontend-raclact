// Cliente HTTP contra raclact-backend. Adjunta el access token y, si el backend
// responde TOKEN_EXPIRED, renueva el par con el refresh token y reintenta una vez.

import { clearSession, getSession, setSession, type AuthResult } from "@/lib/session"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"

/** Error con la forma `{ error, code, details? }` que devuelve el backend. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
  }
}

async function parseError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null)
  return new ApiError(
    res.status,
    body?.code ?? "INTERNAL_ERROR",
    body?.error ?? "No se pudo conectar con el servidor",
    body?.details
  )
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "No se pudo conectar con el servidor")
  }
  if (!res.ok) throw await parseError(res)
  return res.status === 204 ? (undefined as T) : res.json()
}

// Una sola renovación en vuelo: si varias peticiones caducan a la vez, todas
// esperan el mismo refresh en lugar de rotar el token varias veces.
let refreshing: Promise<string> | null = null

function refreshAccessToken(refreshToken: string): Promise<string> {
  refreshing ??= request<AuthResult>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })
    .then((result) => {
      setSession(result)
      return result.accessToken
    })
    .catch((err) => {
      clearSession()
      throw err
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/** Petición autenticada con la sesión actual. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession()
  if (!session) throw new ApiError(401, "UNAUTHORIZED", "No autenticado")

  try {
    return await request<T>(path, init, session.accessToken)
  } catch (err) {
    if (!(err instanceof ApiError) || err.code !== "TOKEN_EXPIRED") {
      if (err instanceof ApiError && err.status === 401) clearSession()
      throw err
    }
    const accessToken = await refreshAccessToken(session.refreshToken)
    return request<T>(path, init, accessToken)
  }
}

export function loginRequest(email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function logoutRequest(refreshToken: string): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })
}
