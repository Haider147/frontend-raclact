"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AuthShell } from "@/components/layout/auth-shell"
import { useAuth } from "@/components/providers/auth-provider"
import { ApiError } from "@/lib/api"
import { getSession } from "@/lib/session"

function errorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No se pudo iniciar sesión"
  if (err.code === "ACCOUNT_LOCKED") {
    const seconds = (err.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds
    if (seconds) return `${err.message}. Inténtalo en ${Math.ceil(seconds / 60)} min.`
  }
  return err.message
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (getSession()) router.replace("/")
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setLoading(true)
    setError(null)
    try {
      const user = await login(String(form.get("email")), String(form.get("password")))
      toast.success(`Bienvenido, ${user.name}`)
      router.replace("/")
    } catch (err) {
      setError(errorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 space-y-1.5">
        <h1 className="heading-page">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa a tu panel administrativo de RacLact.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@raclact.co"
              required
              autoFocus
            />
          </Field>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>

          <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
