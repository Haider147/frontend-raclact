"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Mail, MapPin, Phone, ShoppingBag, Star } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

import { customers, addresses } from "@/mocks/customers"
import { orders } from "@/mocks/orders"
import { reviews } from "@/mocks/reviews"
import { accountStatusMeta, getAccountStatus, orderStatusMeta, roleMeta } from "@/lib/status"
import { formatDate, formatDateTime } from "@/lib/format"
import type { User } from "@/types"

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => setUser(customers.find((c) => c.id === id) ?? null), 500)
    return () => clearTimeout(timer)
  }, [id])

  const userOrders = useMemo(() => orders.filter((o) => o.userId === id), [id])
  const userReviews = useMemo(() => reviews.filter((r) => r.userId === id), [id])
  const userAddresses = useMemo(() => addresses.filter((a) => a.userId === id), [id])

  const activity = useMemo(() => {
    if (!user) return []
    const events = [
      { label: "Cuenta creada", detail: null as string | null, createdAt: user.createdAt },
      ...userOrders.map((o) => ({
        label: `Pedido ${o.number} (${orderStatusMeta[o.status].label.toLowerCase()})`,
        detail: `Total ${o.total}`,
        createdAt: o.createdAt,
      })),
      ...userReviews.map((r) => ({
        label: `Reseña en ${r.productName}`,
        detail: `${r.rating} estrellas`,
        createdAt: r.createdAt,
      })),
    ]
    return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [user, userOrders, userReviews])

  if (user === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (user === null) {
    return <ErrorState title="Cliente no encontrado" description={`No existe ningún cliente con el id "${id}".`} />
  }

  return (
    <div className="space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Clientes
      </Link>

      <PageHeader
        title={user.name}
        description={`Cliente desde ${formatDate(user.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge meta={roleMeta[user.role]} />
            <StatusBadge meta={accountStatusMeta[getAccountStatus(user)]} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Pedidos ({userOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userOrders.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="Sin pedidos" className="border-0 py-10" />
              ) : (
                <ul className="divide-y divide-border">
                  {userOrders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div>
                        <Link href={`/pedidos/${o.id}`} className="font-medium hover:text-copper hover:underline">
                          {o.number}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge meta={orderStatusMeta[o.status]} />
                        <Money value={o.total} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Reseñas ({userReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userReviews.length === 0 ? (
                <EmptyState icon={Star} title="Sin reseñas" className="border-0 py-10" />
              ) : (
                <ul className="space-y-3">
                  {userReviews.map((r) => (
                    <li key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{r.productName}</p>
                        <span className="text-xs text-warning">{"★".repeat(r.rating)}</span>
                      </div>
                      {r.comment ? <p className="text-sm text-muted-foreground">{r.comment}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {activity.map((event, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper" />
                    <div>
                      <p className="text-sm text-foreground">{event.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-2 text-center">
              <Avatar size="lg">
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-heading text-base font-semibold text-navy dark:text-cream">{user.name}</p>
                <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" strokeWidth={1.75} />
                  {user.email}
                </p>
                {user.phone ? (
                  <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" strokeWidth={1.75} />
                    {user.phone}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" strokeWidth={1.75} />
                Direcciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userAddresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin direcciones guardadas.</p>
              ) : (
                <ul className="space-y-3">
                  {userAddresses.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p className="font-medium text-foreground">{a.label ?? "Dirección"}</p>
                      <p className="text-muted-foreground">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}
                      </p>
                      <p className="text-muted-foreground">
                        {a.city}, {a.state}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
