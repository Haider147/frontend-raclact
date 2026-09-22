"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, Star, X } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"

import { reviews as initialReviews } from "@/mocks/reviews"
import { products } from "@/mocks/products"
import { formatDate } from "@/lib/format"
import type { Review, ReviewStatus } from "@/types"

const TABS: { value: ReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "REJECTED", label: "Rechazadas" },
]

export default function ResenasPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rejecting, setRejecting] = useState<Review | null>(null)
  const [note, setNote] = useState("")

  function approve(review: Review) {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: "APPROVED", moderationNote: null } : r)))
    toast.success(`Reseña de ${review.authorName} aprobada`)
  }

  function confirmReject() {
    if (!rejecting) return
    setReviews((prev) =>
      prev.map((r) => (r.id === rejecting.id ? { ...r, status: "REJECTED", moderationNote: note || null } : r))
    )
    toast.success(`Reseña de ${rejecting.authorName} rechazada`)
    setRejecting(null)
    setNote("")
  }

  const productAverages = products.map((p) => {
    const approved = reviews.filter((r) => r.productId === p.id && r.status === "APPROVED")
    const avg = approved.length ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : null
    return { product: p, avg, count: approved.length }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Reseñas" description="Cola de moderación de reseñas de producto." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productAverages.map(({ product, avg, count }) => (
          <Card key={product.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">{count} reseñas aprobadas</p>
              </div>
              <div className="flex items-center gap-1 font-heading text-lg font-semibold text-navy dark:text-cream">
                {avg ? avg.toFixed(1) : "—"}
                <Star className="size-4 text-warning" strokeWidth={1.75} fill="currentColor" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="PENDING">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({reviews.filter((r) => r.status === tab.value).length})
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => {
          const items = reviews.filter((r) => r.status === tab.value)
          return (
            <TabsContent key={tab.value} value={tab.value} className="pt-4">
              {items.length === 0 ? (
                <EmptyState icon={Star} title="Nada por aquí" description="No hay reseñas en este estado." />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {items.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-sm font-medium">
                          {review.productName}
                          <span className="flex items-center gap-0.5 text-warning">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="size-3.5"
                                strokeWidth={1.75}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{review.authorName}</p>
                        {review.title ? <p className="text-sm font-medium">{review.title}</p> : null}
                        {review.comment ? <p className="text-sm text-muted-foreground">{review.comment}</p> : null}
                        <p className="text-xs text-muted-foreground/80">{formatDate(review.createdAt)}</p>
                        {review.moderationNote ? (
                          <p className="rounded-lg bg-danger/5 px-2.5 py-1.5 text-xs text-danger">
                            {review.moderationNote}
                          </p>
                        ) : null}
                        {tab.value === "PENDING" ? (
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" onClick={() => approve(review)}>
                              <Check className="size-3.5" strokeWidth={1.75} />
                              Aprobar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setRejecting(review)}>
                              <X className="size-3.5" strokeWidth={1.75} />
                              Rechazar
                            </Button>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar reseña</DialogTitle>
            <DialogDescription>Deja una nota interna de moderación (opcional).</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="mod-note">Nota interna</FieldLabel>
            <Textarea id="mod-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={confirmReject}>
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
