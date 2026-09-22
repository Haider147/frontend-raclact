"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Ban, PackageCheck, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Order, OrderStatusHistoryEntry } from "@/types"

const CARRIERS = ["Interrapidísimo", "Servientrega", "Coordinadora"]

function historyEntry(order: Order, entry: Omit<OrderStatusHistoryEntry, "id" | "orderId">): OrderStatusHistoryEntry {
  return { id: `${order.number}-hist-${order.statusHistory.length + 1}`, orderId: order.number, ...entry }
}

export function OrderActions({
  order,
  onUpdate,
}: {
  order: Order
  onUpdate: (order: Order) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ShipDialog order={order} onUpdate={onUpdate} />
      <DeliverDialog order={order} onUpdate={onUpdate} />
      <CancelDialog order={order} onUpdate={onUpdate} />
    </div>
  )
}

function ShipDialog({ order, onUpdate }: { order: Order; onUpdate: (order: Order) => void }) {
  const [open, setOpen] = useState(false)
  const [carrier, setCarrier] = useState(CARRIERS[0])
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  if (order.status !== "PAID") return null

  function submit() {
    const now = new Date().toISOString()
    onUpdate({
      ...order,
      status: "SHIPPED",
      carrier,
      trackingNumber,
      trackingUrl: trackingUrl || null,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
      shippedAt: now,
      statusHistory: [
        ...order.statusHistory,
        historyEntry(order, { status: "SHIPPED", note: `${carrier} · guía ${trackingNumber}`, createdAt: now }),
      ],
    })
    toast.success(`Pedido ${order.number} marcado como despachado`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Truck className="size-3.5" strokeWidth={1.75} />
        Marcar como despachado
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Despachar pedido {order.number}</DialogTitle>
          <DialogDescription>Registra la información de la guía de envío.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="carrier">Transportadora</FieldLabel>
            <NativeSelect id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
              {CARRIERS.map((c) => (
                <NativeSelectOption key={c} value={c}>
                  {c}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="tracking-number">Número de guía</FieldLabel>
            <Input
              id="tracking-number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="88452201"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tracking-url">URL de rastreo (opcional)</FieldLabel>
            <Input
              id="tracking-url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="estimated-delivery">Entrega estimada</FieldLabel>
            <Input
              id="estimated-delivery"
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={submit} disabled={!trackingNumber}>
            Confirmar despacho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeliverDialog({ order, onUpdate }: { order: Order; onUpdate: (order: Order) => void }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")

  if (order.status !== "SHIPPED") return null

  function submit() {
    const now = new Date().toISOString()
    onUpdate({
      ...order,
      status: "DELIVERED",
      deliveredAt: now,
      statusHistory: [
        ...order.statusHistory,
        historyEntry(order, { status: "DELIVERED", note: note || null, createdAt: now }),
      ],
    })
    toast.success(`Pedido ${order.number} marcado como entregado`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        <PackageCheck className="size-3.5" strokeWidth={1.75} />
        Marcar como entregado
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar entrega de {order.number}</DialogTitle>
          <DialogDescription>Opcionalmente deja una nota sobre la entrega.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="deliver-note">Nota (opcional)</FieldLabel>
            <Textarea
              id="deliver-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Recibido por el cliente en portería…"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={submit}>Confirmar entrega</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({ order, onUpdate }: { order: Order; onUpdate: (order: Order) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const canCancel = order.status === "PENDING"

  function submit() {
    if (!reason.trim()) return
    const now = new Date().toISOString()
    onUpdate({
      ...order,
      status: "CANCELLED",
      statusHistory: [
        ...order.statusHistory,
        historyEntry(order, { status: "CANCELLED", note: reason.trim(), createdAt: now }),
      ],
    })
    toast.success(`Pedido ${order.number} cancelado`)
    setOpen(false)
  }

  const trigger = (
    <Button size="sm" variant="destructive" disabled={!canCancel}>
      <Ban className="size-3.5" strokeWidth={1.75} />
      Cancelar pedido
    </Button>
  )

  if (!canCancel) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span tabIndex={0} />}>{trigger}</TooltipTrigger>
        <TooltipContent>
          Anular un pedido ya cobrado exige reembolso en la pasarela — no se puede cancelar desde aquí.
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar pedido {order.number}</DialogTitle>
          <DialogDescription>El motivo es obligatorio y queda registrado en el historial.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="cancel-reason">Motivo</FieldLabel>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Dirección errónea, el cliente cambió de decisión…"
              required
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Volver</DialogClose>
          <Button variant="destructive" onClick={submit} disabled={!reason.trim()}>
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
