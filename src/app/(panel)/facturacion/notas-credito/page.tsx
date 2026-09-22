import Link from "next/link"
import { ArrowLeft, FileMinus } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Money } from "@/components/shared/money"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { creditNotes } from "@/mocks/invoicing"
import { formatDate } from "@/lib/format"

export default function NotasCreditoPage() {
  return (
    <div className="space-y-6">
      <Link href="/facturacion" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Facturación
      </Link>
      <PageHeader title="Notas crédito" description="Anulaciones registradas sobre facturas ya emitidas." />

      <Card>
        <CardContent className="px-0">
          {creditNotes.length === 0 ? (
            <EmptyState icon={FileMinus} title="Sin notas crédito" className="border-0 py-16" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.number}</TableCell>
                    <TableCell>
                      <Link href={`/facturacion/${note.invoiceId}`} className="hover:text-copper hover:underline">
                        {note.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{note.reason}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(note.issuedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Money value={note.total} />
                    </TableCell>
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
