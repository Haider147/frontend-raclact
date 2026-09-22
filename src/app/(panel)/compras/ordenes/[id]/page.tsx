"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, PackageCheck } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { purchaseOrders } from "@/mocks/purchasing"
import { purchaseOrderStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { PurchaseOrder } from "@/types"

export default function OrdenCompraDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<PurchaseOrder | null | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => setOrder(purchaseOrders.find((o) => o.id === id) ?? null), 500)
    return () => clearTimeout(timer)
  }, [id])

  function receive() {
    if (!order) return
    const lines = order.lines.map((l) => ({ ...l, quantityReceived: l.quantityOrdered }))
    setOrder({ ...order, status: "RECIBIDA", lines })
    toast.success(`Recepción registrada para ${order.number} — entra al kardex de Inventario`)
  }

  if (order === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  if (order === null) {
    return <ErrorState title="Orden no encontrada" description={`No existe ninguna orden con el id "${id}".`} />
  }

  const canReceive = order.status === "ENVIADA" || order.status === "RECIBIDA_PARCIAL"

  return (
    <div className="space-y-6">
      <Link href="/compras/ordenes" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Órdenes de compra
      </Link>

      <PageHeader
        title={order.number}
        description={`${order.supplierName} · emitida ${formatDate(order.issuedAt)} · esperada ${formatDate(order.expectedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge meta={purchaseOrderStatusMeta[order.status]} />
            {canReceive ? (
              <Button size="sm" onClick={receive}>
                <PackageCheck className="size-3.5" strokeWidth={1.75} />
                Registrar recepción
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Líneas</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead className="text-right">Cant. pedida</TableHead>
                <TableHead className="text-right">Cant. recibida</TableHead>
                <TableHead className="text-right">Costo unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.rawMaterialName}</TableCell>
                  <TableCell className="text-right tabular-nums">{line.quantityOrdered}</TableCell>
                  <TableCell className="text-right tabular-nums">{line.quantityReceived}</TableCell>
                  <TableCell className="text-right">
                    <Money value={line.unitCost} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={String(Number(line.unitCost) * line.quantityOrdered)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end px-4 pt-3">
            <p className="font-heading text-base font-semibold text-navy dark:text-cream">
              Total: <Money value={order.total} />
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Registrar la recepción simula el movimiento de kardex <code className="rounded bg-muted px-1 py-0.5">RESTOCK</code> que
        alimentaría Inventario cuando este módulo se conecte al backend.
      </p>
    </div>
  )
}
