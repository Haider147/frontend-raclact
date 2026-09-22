import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { productionPlan, rawMaterialConsumption } from "@/mocks/production"
import { formatDate, formatNumber } from "@/lib/format"

export default function PlanificacionPage() {
  const lines = Array.from(new Set(productionPlan.map((p) => p.line)))

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
        title="Planificación"
        description="Corridas programadas por línea y consumo estimado de materias primas."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {lines.map((line) => (
          <Card key={line}>
            <CardHeader>
              <CardTitle>{line}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {productionPlan
                .filter((p) => p.line === line)
                .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
                .map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{run.batchCode}</p>
                      <p className="text-xs text-muted-foreground">{run.productName} · {run.volumeLiters} L</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {run.route === "YOGUR" ? "Yogur" : "Kumis"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{formatDate(run.scheduledStart)}</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumo estimado de materias primas</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead className="text-right">Cantidad estimada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterialConsumption.map((rm) => (
                <TableRow key={rm.inputName}>
                  <TableCell>{rm.inputName}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(rm.estimatedQuantity)} {rm.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
