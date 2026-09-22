import Link from "next/link"
import { CalendarClock, FlaskConical } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { STAGE_ORDER, progressIndex } from "@/lib/production-flow"
import { productionBatches } from "@/mocks/production"
import { batchStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { ProductionBatch } from "@/types"

export default function ProduccionPage() {
  const lines = Array.from(new Set(productionBatches.map((b) => b.line))).sort()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Producción"
        description="Las líneas de planta en vivo — de la recepción de leche a la liberación del lote."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/produccion/planificacion" />}>
              <CalendarClock className="size-3.5" strokeWidth={1.75} />
              Planificación
            </Button>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/produccion/calidad" />}>
              <FlaskConical className="size-3.5" strokeWidth={1.75} />
              Control de calidad
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {lines.map((line) => {
          const batches = productionBatches
            .filter((b) => b.line === line)
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          const active = batches.filter((b) => !["LIBERADO", "RECHAZADO", "PLANIFICADO"].includes(b.status)).length

          return (
            <section key={line} className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-navy px-4 py-2.5 text-cream">
                <span className="relative flex size-2">
                  {active > 0 ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-75" /> : null}
                  <span className={cn("relative inline-flex size-2 rounded-full", active > 0 ? "bg-info" : "bg-cream/30")} />
                </span>
                <h2 className="font-heading text-sm font-bold tracking-wide uppercase">{line}</h2>
                <span className="text-xs text-cream/60">
                  {active > 0 ? `${active} lote(s) en curso` : "Sin actividad ahora mismo"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {batches.map((batch) => (
                  <BatchTrackCard key={batch.id} batch={batch} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function BatchTrackCard({ batch }: { batch: ProductionBatch }) {
  const idx = progressIndex(batch.stages)
  const percent = batch.status === "LIBERADO" ? 100 : Math.max(4, Math.round(((idx + 1) / STAGE_ORDER.length) * 100))
  const isActive = !["LIBERADO", "RECHAZADO", "PLANIFICADO"].includes(batch.status)
  const routeColor = batch.route === "YOGUR" ? "var(--func-info)" : "var(--brand-leaf)"
  const trackColor = batch.status === "RECHAZADO" ? "var(--func-danger)" : batch.status === "LIBERADO" ? "var(--func-success)" : routeColor

  return (
    <Link href={`/produccion/lotes/${batch.id}`}>
      <Card className="h-full transition-colors hover:border-copper/40 hover:ring-copper/20">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading text-sm font-semibold text-navy dark:text-cream">{batch.code}</p>
              <p className="text-xs text-muted-foreground">{batch.productName}</p>
            </div>
            <StatusBadge meta={batchStatusMeta[batch.status]} />
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", isActive && "relative overflow-hidden")}
                style={{ width: `${percent}%`, backgroundColor: trackColor }}
              >
                {isActive ? (
                  <span
                    className="absolute inset-0 animate-pulse"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)" }}
                  />
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span
                className="inline-flex items-center gap-1 font-medium"
                style={{ color: batch.status === "RECHAZADO" ? "var(--func-danger)" : undefined }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: trackColor }} />
                {batch.route === "YOGUR" ? "Ruta yogur" : "Ruta kumis"}
              </span>
              <span>{batch.volumeLiters} L</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground/80">
            <span>{batch.responsibleName.split(" ")[0]}</span>
            <span>Inicio: {formatDate(batch.startedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
