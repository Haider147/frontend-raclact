"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductionLineDiagram } from "@/components/produccion/production-line-diagram"
import { ProcessVariableCard } from "@/components/produccion/process-variable-card"

import { productionBatches, qualityTests } from "@/mocks/production"
import { batchStatusMeta } from "@/lib/status"
import { formatDate, formatDateTime } from "@/lib/format"
import type { ProductionBatch } from "@/types"

export default function LoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [batch, setBatch] = useState<ProductionBatch | null | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => setBatch(productionBatches.find((b) => b.id === id) ?? null), 500)
    return () => clearTimeout(timer)
  }, [id])

  if (batch === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (batch === null) {
    return <ErrorState title="Lote no encontrado" description={`No existe ningún lote con el id "${id}".`} />
  }

  const tests = qualityTests.filter((t) => t.batchId === batch.id)

  return (
    <div className="space-y-6">
      <Link
        href="/produccion"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Producción
      </Link>

      <PageHeader
        title={batch.code}
        description={`${batch.productName} · ${batch.line} · Responsable: ${batch.responsibleName}`}
        actions={<StatusBadge meta={batchStatusMeta[batch.status]} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Línea de producción</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductionLineDiagram batch={batch} />
          <p className="pt-3 text-xs text-muted-foreground">
            Volumen: {batch.volumeLiters} L · Inicio: {formatDate(batch.startedAt)}
            {batch.estimatedEndAt ? ` · Fin estimado: ${formatDate(batch.estimatedEndAt)}` : ""}
            {" · "}Haz clic en cualquier etapa para ver el detalle.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold tracking-wide text-navy uppercase dark:text-cream">
          Variables del proceso
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batch.variables.map((v) => (
            <ProcessVariableCard key={v.key} variable={v} />
          ))}
        </div>
      </div>

      {tests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pruebas de calidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tests.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <span>
                  pH {t.ph} · Acidez {t.acidity} · {t.temperatureC}°C
                </span>
                <span className="flex items-center gap-2">
                  <span className={t.withinRange ? "text-success" : "text-danger"}>
                    {t.withinRange ? "Dentro de rango" : "Fuera de rango"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(t.performedAt)}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
