"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CornerDownRight, Pencil, Plus, Tags, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CategoryFormDialog } from "@/components/productos/category-form-dialog"

import { categories as initialCategories, products } from "@/mocks/products"
import type { Category } from "@/types"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [dialogState, setDialogState] = useState<{ open: boolean; category?: Category; parentId?: string }>({
    open: false,
  })
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const roots = categories.filter((c) => !c.parentId).sort((a, b) => a.position - b.position)
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id).sort((a, b) => a.position - b.position)

  function handleSave(category: Category) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id)
      return exists ? prev.map((c) => (c.id === category.id ? category : c)) : [...prev, category]
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    const hasChildren = categories.some((c) => c.parentId === deleteTarget.id)
    const hasProducts = products.some((p) => p.categoryId === deleteTarget.id)
    if (hasChildren || hasProducts) {
      toast.error("No se puede eliminar", {
        description: hasChildren
          ? "Esta categoría tiene subcategorías — muévelas o elimínalas primero."
          : "Hay productos asignados a esta categoría.",
      })
      setDeleteTarget(null)
      return
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    toast.success(`Categoría "${deleteTarget.name}" eliminada`)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Árbol de categorías del catálogo — Kumis, Yogur y sus sabores."
        actions={
          <Button onClick={() => setDialogState({ open: true })}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Nueva categoría
          </Button>
        }
      />

      <Card>
        <CardContent>
          {roots.length === 0 ? (
            <EmptyState
              icon={Tags}
              title="Sin categorías"
              description="Crea la primera categoría del catálogo."
              className="border-0 py-16"
            />
          ) : (
            <ul className="divide-y divide-border">
              {roots.map((root) => (
                <li key={root.id} className="py-3 first:pt-0 last:pb-0">
                  <CategoryRow
                    category={root}
                    onEdit={() => setDialogState({ open: true, category: root })}
                    onAddChild={() => setDialogState({ open: true, parentId: root.id })}
                    onDelete={() => setDeleteTarget(root)}
                  />
                  {childrenOf(root.id).length > 0 ? (
                    <ul className="mt-2 ml-6 space-y-2 border-l border-border pl-4">
                      {childrenOf(root.id).map((child) => (
                        <li key={child.id}>
                          <CategoryRow
                            category={child}
                            isChild
                            onEdit={() => setDialogState({ open: true, category: child })}
                            onDelete={() => setDeleteTarget(child)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
        category={dialogState.category}
        defaultParentId={dialogState.parentId}
        parents={roots}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryRow({
  category,
  isChild = false,
  onEdit,
  onAddChild,
  onDelete,
}: {
  category: Category
  isChild?: boolean
  onEdit: () => void
  onAddChild?: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {isChild ? <CornerDownRight className="size-3.5 text-muted-foreground" strokeWidth={1.75} /> : null}
        <div>
          <p className="text-sm font-medium text-foreground">{category.name}</p>
          <p className="text-xs text-muted-foreground">/{category.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onAddChild ? (
          <Button variant="ghost" size="sm" onClick={onAddChild}>
            <Plus className="size-3.5" strokeWidth={1.75} />
            Subcategoría
          </Button>
        ) : null}
        <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={onEdit}>
          <Pencil className="size-3.5" strokeWidth={1.75} />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Eliminar" onClick={onDelete}>
          <Trash2 className="size-3.5 text-danger" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}
