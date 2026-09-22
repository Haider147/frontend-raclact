"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AuthShell } from "@/components/layout/auth-shell"

export default function RecoverPasswordPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <AuthShell>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Volver a iniciar sesión
      </Link>

      {sent ? (
        <div className="space-y-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent text-navy dark:text-cream">
            <MailCheck className="size-6" strokeWidth={1.75} />
          </span>
          <h1 className="heading-page">Revisa tu correo</h1>
          <p className="text-sm text-muted-foreground">
            Si el correo existe en RacLact, te enviamos instrucciones para restablecer tu contraseña.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 space-y-1.5">
            <h1 className="heading-page">Recuperar contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Te enviaremos un enlace para crear una contraseña nueva.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input id="email" type="email" placeholder="tu@raclact.co" required autoFocus />
              </Field>
              <Button type="submit" className="mt-2 w-full" size="lg">
                Enviar instrucciones
              </Button>
            </FieldGroup>
          </form>
        </>
      )}
    </AuthShell>
  )
}
