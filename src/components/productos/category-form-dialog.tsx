"use client"

import { useState } from "react"
import { toast } from "sonner"
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
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Category } from "@/types"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultParentId,
  parents,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** undefined = crear; con valor = editar. */
  category?: Category
  /** Preselecciona el padre al crear una subcategoría desde su fila. */
  defaultParentId?: string
  parents: Category[]
  onSave: (category: Category) => void
}) {
  const [name, setName] = useState(category?.name ?? "")
  const [parentId, setParentId] = useState(category?.parentId ?? defaultParentId ?? "")

  // Reasigna los campos del formulario cada vez que el diálogo pasa a abierto
  // (el popup permanece montado entre aperturas, así que no se reinicia solo).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(category?.name ?? "")
      setParentId(category?.parentId ?? defaultParentId ?? "")
    }
  }

  function submit() {
    if (!name.trim()) return
    onSave({
      id: category?.id ?? `cat_${slugify(name)}_${Date.now()}`,
      name: name.trim(),
      slug: slugify(name),
      parentId: parentId || null,
      position: category?.position ?? 99,
    })
    toast.success(category ? "Categoría actualizada" : "Categoría creada")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          <DialogDescription>
            {category ? "Actualiza el nombre o el padre de la categoría." : "Crea una categoría o subcategoría del catálogo."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="cat-name">Nombre</FieldLabel>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
            <FieldDescription>Slug: {slugify(name) || "—"}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="cat-parent">Categoría padre</FieldLabel>
            <NativeSelect id="cat-parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <NativeSelectOption value="">Ninguna (categoría raíz)</NativeSelectOption>
              {parents
                .filter((p) => p.id !== category?.id)
                .map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.name}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={submit} disabled={!name.trim()}>
            {category ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
