import Link from "next/link"
import { AlertTriangle, PackageSearch, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import type { ProductVariant } from "@/types"
import type { pendingReviews as PendingReviews } from "@/mocks/reviews"

export function OpsPanel({
  lowStockVariants,
  pendingReviews,
}: {
  lowStockVariants: (ProductVariant & { productName: string })[]
  pendingReviews: typeof PendingReviews
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" strokeWidth={1.75} />
            Stock bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockVariants.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Todo en orden"
              description="Ninguna variante está bajo el umbral de stock."
              className="border-0 py-8"
            />
          ) : (
            <ul className="space-y-2.5">
              {lowStockVariants.slice(0, 5).map((variant) => (
                <li key={variant.id}>
                  <Link
                    href={`/inventario/${variant.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-muted/60"
                  >
                    <span className="min-w-0 truncate">
                      {variant.productName}
                      {variant.color ? ` · ${variant.color}` : ""} · {variant.size}
                    </span>
                    <Badge variant="destructive" className="shrink-0">
                      {variant.stock} u.
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-4 text-copper" strokeWidth={1.75} />
            Reseñas por moderar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Sin pendientes"
              description="No hay reseñas esperando moderación."
              className="border-0 py-8"
            />
          ) : (
            <ul className="space-y-3">
              {pendingReviews.slice(0, 4).map((review) => (
                <li key={review.id}>
                  <Link href="/resenas" className="block rounded-lg px-1.5 py-1 hover:bg-muted/60">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{review.authorName}</p>
                      <span className="flex shrink-0 items-center gap-0.5 text-xs text-warning">
                        {review.rating}
                        <Star className="size-3" strokeWidth={1.75} fill="currentColor" />
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {review.productName} · {review.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
