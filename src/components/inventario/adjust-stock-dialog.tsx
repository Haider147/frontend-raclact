"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Boxes } from "lucide-react"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { ManualStockMovementReason } from "@/types"

const REASON_LABELS: Record<ManualStockMovementReason, string> = {
  RESTOCK: "Reposición",
  ADJUSTMENT: "Ajuste",
  RETURN: "Devolución",
  DAMAGE: "Merma",
}

export function AdjustStockDialog({
  variantLabel,
  onAdjust,
}: {
  variantLabel: string
  onAdjust: (input: { reason: ManualStockMovementReason; quantity: number; note: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ManualStockMovementReason>("RESTOCK")
  const [quantity, setQuantity] = useState("")
  const [note, setNote] = useState("")

  const isOut = reason === "DAMAGE"
  const numericQty = Number(quantity)
  const valid = quantity !== "" && numericQty !== 0

  function submit() {
    if (!valid) return
    const signed = isOut ? -Math.abs(numericQty) : Math.abs(numericQty)
    onAdjust({ reason, quantity: signed, note })
    toast.success(`Stock ajustado: ${signed > 0 ? "+" : ""}${signed} u. en ${variantLabel}`)
    setOpen(false)
    setQuantity("")
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Boxes className="size-3.5" strokeWidth={1.75} />
        Ajustar stock
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock — {variantLabel}</DialogTitle>
          <DialogDescription>
            Registra un movimiento manual de kardex. Venta y cancelación las escribe el flujo de pedidos.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="adj-reason">Motivo</FieldLabel>
            <NativeSelect
              id="adj-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as ManualStockMovementReason)}
            >
              {(Object.keys(REASON_LABELS) as ManualStockMovementReason[]).map((r) => (
                <NativeSelectOption key={r} value={r}>
                  {REASON_LABELS[r]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="adj-qty">
              Cantidad {isOut ? "(se restará del saldo)" : "(se sumará al saldo)"}
            </FieldLabel>
            <Input
              id="adj-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="adj-note">Nota (opcional)</FieldLabel>
            <Textarea id="adj-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={submit} disabled={!valid}>
            Confirmar ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
