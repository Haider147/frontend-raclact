"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { products } from "@/mocks/products"
import type { DiscountCode, DiscountScope, DiscountType } from "@/types"

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ""
}

export function DiscountFormSheet({
  open,
  onOpenChange,
  discount,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount?: DiscountCode
  onSave: (discount: DiscountCode) => void
}) {
  const [code, setCode] = useState(discount?.code ?? "")
  const [type, setType] = useState<DiscountType>(discount?.type ?? "PERCENTAGE")
  const [value, setValue] = useState(discount?.value ?? "")
  const [scope, setScope] = useState<DiscountScope>(discount?.scope ?? "ORDER")
  const [productId, setProductId] = useState(discount?.productId ?? "")
  const [minSubtotal, setMinSubtotal] = useState(discount?.minSubtotal ?? "")
  const [startsAt, setStartsAt] = useState(toDateInput(discount?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(toDateInput(discount?.endsAt ?? null))
  const [isActive, setIsActive] = useState(discount?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCode(discount?.code ?? "")
      setType(discount?.type ?? "PERCENTAGE")
      setValue(discount?.value ?? "")
      setScope(discount?.scope ?? "ORDER")
      setProductId(discount?.productId ?? "")
      setMinSubtotal(discount?.minSubtotal ?? "")
      setStartsAt(toDateInput(discount?.startsAt ?? null))
      setEndsAt(toDateInput(discount?.endsAt ?? null))
      setIsActive(discount?.isActive ?? true)
      setError(null)
    }
  }

  function submit() {
    if (!code.trim()) return setError("El código es obligatorio.")
    if (scope === "PRODUCT" && !productId) return setError("Selecciona un producto para un cupón de alcance Producto.")
    if (type === "PERCENTAGE" && Number(value) > 100) return setError("Un porcentaje no puede superar 100.")
    if (startsAt && endsAt && startsAt > endsAt) return setError("La fecha de inicio debe ir antes que la de fin.")

    const product = products.find((p) => p.id === productId)
    onSave({
      id: discount?.id ?? `disc_${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value,
      scope,
      productId: scope === "PRODUCT" ? productId : null,
      productName: scope === "PRODUCT" ? (product?.name ?? null) : null,
      minSubtotal: minSubtotal || null,
      maxRedemptions: discount?.maxRedemptions ?? null,
      maxRedemptionsPerUser: discount?.maxRedemptionsPerUser ?? 1,
      usedCount: discount?.usedCount ?? 0,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      isActive,
    })
    toast.success(discount ? "Cupón actualizado" : "Cupón creado")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{discount ? "Editar cupón" : "Nuevo cupón"}</SheetTitle>
          <SheetDescription>Define el tipo, alcance y vigencia del descuento.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="d-code">Código</FieldLabel>
              <Input id="d-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoFocus />
            </Field>
            <Field orientation="horizontal">
              <div className="w-full">
                <FieldLabel htmlFor="d-type">Tipo</FieldLabel>
                <NativeSelect id="d-type" value={type} onChange={(e) => setType(e.target.value as DiscountType)} className="w-full">
                  <NativeSelectOption value="PERCENTAGE">Porcentaje</NativeSelectOption>
                  <NativeSelectOption value="FIXED">Monto fijo</NativeSelectOption>
                </NativeSelect>
              </div>
              <div className="w-full">
                <FieldLabel htmlFor="d-value">Valor</FieldLabel>
                <Input id="d-value" type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="d-scope">Alcance</FieldLabel>
              <NativeSelect id="d-scope" value={scope} onChange={(e) => setScope(e.target.value as DiscountScope)}>
                <NativeSelectOption value="ORDER">Pedido completo</NativeSelectOption>
                <NativeSelectOption value="PRODUCT">Producto específico</NativeSelectOption>
              </NativeSelect>
            </Field>
            {scope === "PRODUCT" ? (
              <Field>
                <FieldLabel htmlFor="d-product">Producto</FieldLabel>
                <NativeSelect id="d-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <NativeSelectOption value="">Selecciona un producto</NativeSelectOption>
                  {products.map((p) => (
                    <NativeSelectOption key={p.id} value={p.id}>
                      {p.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="d-min">Subtotal mínimo (opcional)</FieldLabel>
              <Input id="d-min" type="number" min={0} value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} />
            </Field>
            <Field orientation="horizontal">
              <div className="w-full">
                <FieldLabel htmlFor="d-start">Vigencia desde</FieldLabel>
                <Input id="d-start" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div className="w-full">
                <FieldLabel htmlFor="d-end">Vigencia hasta</FieldLabel>
                <Input id="d-end" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="d-active">Activo</FieldLabel>
              <input
                id="d-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4"
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <SheetClose render={<Button variant="outline" />}>Cancelar</SheetClose>
          <Button onClick={submit}>{discount ? "Guardar cambios" : "Crear cupón"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
