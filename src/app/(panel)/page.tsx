"use client"

import { FlaskConical } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { useAuth } from "@/components/providers/auth-provider"
import { roleLabels } from "@/lib/session"

export default function HomePage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <>
      <PageHeader
        title={`Hola, ${user.name}`}
        description={`Sesión iniciada como ${roleLabels[user.role]}.`}
      />
      <EmptyState
        icon={FlaskConical}
        title="Aún no hay módulos"
        description="Aquí aparecerán las secciones del panel a medida que se conecten con el backend."
      />
    </>
  )
}
