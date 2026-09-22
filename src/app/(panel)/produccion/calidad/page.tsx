import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FlaskConical } from "lucide-react"

import { qualityTests } from "@/mocks/production"
import { formatDateTime } from "@/lib/format"

export default function CalidadPage() {
  const sorted = [...qualityTests].sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())

  return (
    <div className="space-y-6">
      <Link
        href="/produccion"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Producción
      </Link>

      <PageHeader title="Control de calidad" description="Pruebas registradas por lote y liberación de producto." />

      <Card>
        <CardContent className="px-0">
          {sorted.length === 0 ? (
            <EmptyState icon={FlaskConical} title="Sin pruebas registradas" className="border-0 py-16" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">pH</TableHead>
                  <TableHead className="text-right">Acidez</TableHead>
                  <TableHead className="text-right">Temp.</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Liberado</TableHead>
                  <TableHead>Realizada por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/produccion/lotes/${t.batchId}`} className="font-medium hover:text-copper hover:underline">
                        {t.batchCode}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(t.performedAt)}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.ph}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.acidity}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.temperatureC}°C</TableCell>
                    <TableCell>
                      <Badge className={t.withinRange ? "bg-success/12 text-success" : "bg-danger/12 text-danger"}>
                        {t.withinRange ? "Dentro de rango" : "Fuera de rango"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.released ? "outline" : "secondary"}>{t.released ? "Sí" : "No"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.performedByName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
