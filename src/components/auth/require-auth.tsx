"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/providers/auth-provider"
import { api } from "@/lib/api"
import { getSession } from "@/lib/session"

/** Deja pasar solo con sesión; si no, manda al login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()

  // Se lee localStorage directamente y no `user`: en el primer render tras la
  // hidratación `user` todavía vale null aunque haya sesión guardada.
  useEffect(() => {
    if (!getSession()) router.replace("/login")
  }, [router, user])

  // Valida la sesión guardada contra el backend (y la renueva si caducó). Si ya
  // no vale, `api` la borra y el efecto de arriba redirige.
  useEffect(() => {
    if (getSession()) api("/auth/me").catch(() => undefined)
  }, [])

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return children
}
