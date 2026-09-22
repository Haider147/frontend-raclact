"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { categories } from "@/mocks/products"
import type { Product } from "@/types"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ProductGeneralTab({
  draft,
  onChange,
}: {
  draft: Product
  onChange: (patch: Partial<Product>) => void
}) {
  return (
    <Card>
      <CardContent>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel htmlFor="p-name">Nombre</FieldLabel>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value, slug: slugify(e.target.value) })}
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="p-slug">Slug</FieldLabel>
            <div className="w-full">
              <Input id="p-slug" value={draft.slug} onChange={(e) => onChange({ slug: slugify(e.target.value) })} />
              <FieldDescription>Se autogenera a partir del nombre — editable.</FieldDescription>
            </div>
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="p-desc">Descripción</FieldLabel>
            <Textarea
              id="p-desc"
              value={draft.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={4}
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="p-price">Precio base</FieldLabel>
            <div className="flex w-full items-center gap-2">
              <Input
                id="p-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => onChange({ price: e.target.value })}
                className="max-w-40"
              />
              <span className="text-sm text-muted-foreground">COP</span>
            </div>
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="p-category">Categoría</FieldLabel>
            <NativeSelect
              id="p-category"
              value={draft.categoryId ?? ""}
              onChange={(e) => onChange({ categoryId: e.target.value || null })}
              className="max-w-60"
            >
              <NativeSelectOption value="">Sin categoría</NativeSelectOption>
              {categories.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.parentId ? `— ${c.name}` : c.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="p-active">Activo</FieldLabel>
            <Switch id="p-active" checked={draft.isActive} onCheckedChange={(v) => onChange({ isActive: v })} />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
