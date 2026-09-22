"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CreditCard, MapPin, Truck, User } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { OrderTimeline } from "@/components/pedidos/order-timeline"
import { OrderActions } from "@/components/pedidos/order-actions"

import { getOrderByNumber } from "@/mocks/orders"
import { orderStatusMeta } from "@/lib/status"
import { formatDate, formatDateTime } from "@/lib/format"
import type { Order } from "@/types"

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => setOrder(getOrderByNumber(id) ?? null), 500)
    return () => clearTimeout(timer)
  }, [id])

  if (order === undefined) return <DetailSkeleton />

  if (order === null) {
    return (
      <ErrorState
        title="Pedido no encontrado"
        description={`No existe ningún pedido con el número "${id}".`}
      />
    )
  }

  return <OrderDetail order={order} onUpdate={setOrder} />
}

function OrderDetail({ order, onUpdate }: { order: Order; onUpdate: (order: Order) => void }) {
  return (
    <div className="space-y-6">
      <Link
        href="/pedidos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Todos los pedidos
      </Link>

      <PageHeader
        title={`Pedido ${order.number}`}
        description={`Creado el ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge meta={orderStatusMeta[order.status]} />
            <OrderActions order={order} onUpdate={onUpdate} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Líneas del pedido</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Presentación</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              width={36}
                              height={36}
                              className="size-9 shrink-0 rounded-lg ring-1 ring-border"
                            />
                          ) : null}
                          <span className="max-w-40 truncate font-medium">{item.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {[item.variantSize, item.variantColor].filter(Boolean).join(" · ")}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Money value={item.unitPrice} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={item.lineTotal} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="ml-auto mt-4 w-full max-w-xs space-y-1.5 px-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <Money value={order.subtotal} tone="muted" />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento</span>
                  <Money value={String(-Number(order.discountTotal))} tone="muted" />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <Money value={order.shippingTotal} tone="muted" />
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between font-heading text-base font-semibold text-navy dark:text-cream">
                  <span>Total</span>
                  <Money value={order.total} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{order.buyerName}</p>
              <p className="text-muted-foreground">{order.buyerEmail}</p>
              {order.buyerPhone ? <p className="text-muted-foreground">{order.buyerPhone}</p> : null}
              <p className="pt-2 text-xs text-muted-foreground/80">
                Datos congelados al momento del pedido — pueden diferir del perfil actual del cliente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-foreground">
                {order.shipLine1}
                {order.shipLine2 ? `, ${order.shipLine2}` : ""}
              </p>
              <p className="text-muted-foreground">
                {order.shipCity}
                {order.shipState ? `, ${order.shipState}` : ""}
              </p>
              <p className="text-muted-foreground">
                {order.shipCountry} · {order.shipPostalCode}
              </p>
              {order.shipMethodName ? (
                <p className="pt-2 text-xs text-muted-foreground/80">{order.shipMethodName}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {order.paidAt ? (
                <>
                  <p className="text-foreground">{order.gateway} · {order.paymentMethod}</p>
                  <p className="text-muted-foreground">ID: {order.gatewayTransactionId}</p>
                  <p className="text-muted-foreground">{formatDateTime(order.paidAt)}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Aún no se ha registrado un pago.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Despacho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {order.carrier ? (
                <>
                  <p className="text-foreground">{order.carrier}</p>
                  <p className="text-muted-foreground">Guía: {order.trackingNumber}</p>
                  {order.trackingUrl ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      nativeButton={false}
                      render={<a href={order.trackingUrl} target="_blank" rel="noreferrer" />}
                    >
                      Rastrear envío
                    </Button>
                  ) : null}
                  {order.estimatedDelivery ? (
                    <p className="text-muted-foreground">Entrega estimada: {formatDate(order.estimatedDelivery)}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">Aún no se ha despachado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
