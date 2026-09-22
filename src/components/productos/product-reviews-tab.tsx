import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { reviewStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { Review } from "@/types"

export function ProductReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={Star}
            title="Sin reseñas todavía"
            description="Las reseñas de este producto aparecerán aquí."
            className="border-0 py-14"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{review.authorName}</p>
              <StatusBadge meta={reviewStatusMeta[review.status]} />
            </div>
            <div className="flex items-center gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5" strokeWidth={1.75} fill={i < review.rating ? "currentColor" : "none"} />
              ))}
            </div>
            {review.title ? <p className="text-sm font-medium text-foreground">{review.title}</p> : null}
            {review.comment ? <p className="text-sm text-muted-foreground">{review.comment}</p> : null}
            <p className="text-xs text-muted-foreground/80">{formatDate(review.createdAt)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
