"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus, Truck } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { shippingMethods as initialMethods } from "@/mocks/shipping"
import { orders } from "@/mocks/orders"
import { formatMoney } from "@/lib/format"
import type { ShippingMethod } from "@/types"

export default function EnviosPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>(initialMethods)
  const [dialogState, setDialogState] = useState<{ open: boolean; method?: ShippingMethod }>({ open: false })

  function toggleActive(method: ShippingMethod) {
    const hasOrders = orders.some((o) => o.shipMethodName === method.name)
    if (hasOrders && method.isActive) {
      setMethods((prev) => prev.map((m) => (m.id === method.id ? { ...m, isActive: false } : m)))
      toast.success(`"${method.name}" desactivado — tiene pedidos asociados, no se puede borrar`)
      return
    }
    setMethods((prev) => prev.map((m) => (m.id === method.id ? { ...m, isActive: !m.isActive } : m)))
  }

  function save(method: ShippingMethod) {
    setMethods((prev) => {
      const exists = prev.some((m) => m.id === method.id)
      return exists ? prev.map((m) => (m.id === method.id ? method : m)) : [...prev, method]
    })
    toast.success(dialogState.method ? "Método actualizado" : "Método creado")
    setDialogState({ open: false })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Envíos"
        description="Métodos de envío de tarifa fija disponibles en el checkout."
        actions={
          <Button onClick={() => setDialogState({ open: true })}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Nuevo método
          </Button>
        }
      />

      {methods.length === 0 ? (
        <EmptyState icon={Truck} title="Sin métodos de envío" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...methods]
            .sort((a, b) => a.position - b.position)
            .map((method) => (
              <Card key={method.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading text-sm font-semibold text-navy dark:text-cream">{method.name}</p>
                      {method.description ? (
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      ) : null}
                    </div>
                    <Badge variant={method.isActive ? "outline" : "secondary"}>
                      {method.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Tarifa: {Number(method.price) === 0 ? "Gratis" : formatMoney(method.price)}</span>
                    {method.freeOverAmount ? <span>Gratis desde {formatMoney(method.freeOverAmount)}</span> : null}
                    <span>
                      Plazo: {method.estimatedDaysMin === method.estimatedDaysMax
                        ? `${method.estimatedDaysMin} día(s)`
                        : `${method.estimatedDaysMin}–${method.estimatedDaysMax} días`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogState({ open: true, method })}
                    >
                      <Pencil className="size-3.5" strokeWidth={1.75} />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(method)}>
                      {method.isActive ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <ShippingMethodDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
        method={dialogState.method}
        nextPosition={methods.length + 1}
        onSave={save}
      />
    </div>
  )
}

function ShippingMethodDialog({
  open,
  onOpenChange,
  method,
  nextPosition,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  method?: ShippingMethod
  nextPosition: number
  onSave: (method: ShippingMethod) => void
}) {
  const [name, setName] = useState(method?.name ?? "")
  const [description, setDescription] = useState(method?.description ?? "")
  const [price, setPrice] = useState(method?.price ?? "0")
  const [freeOverAmount, setFreeOverAmount] = useState(method?.freeOverAmount ?? "")
  const [daysMin, setDaysMin] = useState(String(method?.estimatedDaysMin ?? 1))
  const [daysMax, setDaysMax] = useState(String(method?.estimatedDaysMax ?? 3))

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(method?.name ?? "")
      setDescription(method?.description ?? "")
      setPrice(method?.price ?? "0")
      setFreeOverAmount(method?.freeOverAmount ?? "")
      setDaysMin(String(method?.estimatedDaysMin ?? 1))
      setDaysMax(String(method?.estimatedDaysMax ?? 3))
    }
  }

  function submit() {
    if (!name.trim()) return
    onSave({
      id: method?.id ?? `ship_${Date.now()}`,
      name: name.trim(),
      description: description || null,
      provider: "MANUAL",
      price,
      currency: "COP",
      freeOverAmount: freeOverAmount || null,
      estimatedDaysMin: Number(daysMin),
      estimatedDaysMax: Number(daysMax),
      isActive: method?.isActive ?? true,
      position: method?.position ?? nextPosition,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{method ? "Editar método de envío" : "Nuevo método de envío"}</DialogTitle>
          <DialogDescription>Todos los métodos de la maqueta son de tarifa fija (manual).</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="s-name">Nombre</FieldLabel>
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field>
            <FieldLabel htmlFor="s-desc">Descripción</FieldLabel>
            <Textarea id="s-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>
          <Field orientation="horizontal">
            <div className="w-full">
              <FieldLabel htmlFor="s-price">Tarifa (COP)</FieldLabel>
              <Input id="s-price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="w-full">
              <FieldLabel htmlFor="s-free">Envío gratis desde</FieldLabel>
              <Input
                id="s-free"
                type="number"
                min={0}
                value={freeOverAmount}
                onChange={(e) => setFreeOverAmount(e.target.value)}
              />
            </div>
          </Field>
          <Field orientation="horizontal">
            <div className="w-full">
              <FieldLabel htmlFor="s-min">Días mínimo</FieldLabel>
              <Input id="s-min" type="number" min={0} value={daysMin} onChange={(e) => setDaysMin(e.target.value)} />
            </div>
            <div className="w-full">
              <FieldLabel htmlFor="s-max">Días máximo</FieldLabel>
              <Input id="s-max" type="number" min={0} value={daysMax} onChange={(e) => setDaysMax(e.target.value)} />
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={submit} disabled={!name.trim()}>
            {method ? "Guardar cambios" : "Crear método"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
