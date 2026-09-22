import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { rawMaterials } from "@/mocks/purchasing"
import { formatNumber } from "@/lib/format"

export default function InsumosPage() {
  return (
    <div className="space-y-6">
      <Link href="/compras" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Compras
      </Link>
      <PageHeader title="Insumos" description="Materias primas y empaques con su punto de reposición." />

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Punto de reposición</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.map((rm) => {
                const low = rm.stock < rm.reorderPoint
                return (
                  <TableRow key={rm.id}>
                    <TableCell className="font-medium">{rm.name}</TableCell>
                    <TableCell className="text-muted-foreground">{rm.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(rm.stock)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatNumber(rm.reorderPoint)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={low ? "destructive" : "outline"}>{low ? "Bajo punto de reposición" : "Saludable"}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
