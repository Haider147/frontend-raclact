"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AuthShell } from "@/components/layout/auth-shell"
import { usePanelRole } from "@/components/providers/panel-role-provider"
import { PANEL_ROLES, panelRoleMeta, type PanelRole } from "@/lib/panel-role"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const { setRole } = usePanelRole()
  const [selectedRole, setSelectedRole] = useState<PanelRole>("ADMIN")
  const [loading, setLoading] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    // Maqueta sin backend: cualquier credencial entra al panel, con el rol elegido abajo.
    setTimeout(() => {
      setRole(selectedRole)
      toast.success(`Sesión iniciada como ${panelRoleMeta[selectedRole].label}`)
      router.push("/")
    }, 400)
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
            <Input id="email" type="email" placeholder="tu@raclact.co" required autoFocus />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <Link href="/login/recuperar" className="text-xs font-medium text-copper hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" required />
          </Field>

          <Field>
            <FieldLabel>Rol</FieldLabel>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Rol del panel">
              {PANEL_ROLES.map((role) => {
                const meta = panelRoleMeta[role]
                const active = selectedRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "relative flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-copper bg-accent"
                        : "border-input hover:border-copper/40 hover:bg-muted/50"
                    )}
                  >
                    {active ? (
                      <Check className="absolute top-2 right-2 size-3.5 text-copper" strokeWidth={2} />
                    ) : null}
                    <span className="text-sm font-medium text-foreground">{meta.label}</span>
                    <span className="text-xs text-muted-foreground">{meta.description}</span>
                  </button>
                )
              })}
            </div>
          </Field>

          <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Maqueta sin backend — cualquier credencial ingresa al panel con el rol elegido.
      </p>
    </AuthShell>
  )
}
