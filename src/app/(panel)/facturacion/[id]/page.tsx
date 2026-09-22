"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Download, Mail } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { invoices } from "@/mocks/invoicing"
import { invoiceStatusMeta } from "@/lib/status"
import { formatDate, formatMoney } from "@/lib/format"
import type { Invoice } from "@/types"

export default function FacturaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => setInvoice(invoices.find((i) => i.id === id) ?? null), 500)
    return () => clearTimeout(timer)
  }, [id])

  if (invoice === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mx-auto h-[720px] w-full max-w-2xl rounded-2xl" />
      </div>
    )
  }

  if (invoice === null) {
    return <ErrorState title="Factura no encontrada" description={`No existe ninguna factura con el id "${id}".`} />
  }

  return (
    <div className="space-y-6">
      <Link href="/facturacion" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Facturación
      </Link>

      <PageHeader
        title={invoice.number}
        description={`Pedido ${invoice.orderId ?? "—"} · emitida ${formatDate(invoice.issuedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge meta={invoiceStatusMeta[invoice.status]} />
            <Button variant="outline" size="sm" onClick={() => toast.success("PDF generado (simulado)")}>
              <Download className="size-3.5" strokeWidth={1.75} />
              Descargar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Factura enviada a ${invoice.customerName} (simulado)`)}
            >
              <Mail className="size-3.5" strokeWidth={1.75} />
              Enviar por correo
            </Button>
          </div>
        }
      />

      <Card className="mx-auto w-full max-w-[680px] p-10">
        <CardContent className="space-y-8 px-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-cream">
                RL
              </span>
              <div>
                <p className="font-heading text-base font-bold tracking-wide text-navy uppercase dark:text-cream">RacLact S.A.S.</p>
                <p className="text-xs text-muted-foreground">NIT 900.123.456-7 · Km 3 vía Yumbo, Valle del Cauca</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-sm font-semibold text-navy dark:text-cream">Factura {invoice.number}</p>
              <p className="text-xs text-muted-foreground">{formatDate(invoice.issuedAt)}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Facturar a</p>
              <p className="font-medium text-foreground">{invoice.customerName}</p>
              {invoice.customerNit ? <p className="text-muted-foreground">NIT {invoice.customerNit}</p> : null}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase">Pedido asociado</p>
              <p className="text-muted-foreground">{invoice.orderId ?? "—"}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.id} className="border-b border-border/60">
                  <td className="py-2">{line.description}</td>
                  <td className="py-2 text-right">{line.quantity}</td>
                  <td className="py-2 text-right">{formatMoney(line.unitPrice)}</td>
                  <td className="py-2 text-right">{formatMoney(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto w-full max-w-56 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Base</span>
              <span>{formatMoney(invoice.base)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA (19%)</span>
              <span>{formatMoney(invoice.vat)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-heading text-base font-semibold text-navy dark:text-cream">
              <span>Total</span>
              <span>{formatMoney(invoice.total)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/70">
            Documento de maqueta — no constituye una factura electrónica válida ante la DIAN.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
