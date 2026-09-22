import Link from "next/link"
import { ArrowRight, ClipboardList } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Money } from "@/components/shared/money"
import { EmptyState } from "@/components/shared/empty-state"
import { orderStatusMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { Order } from "@/types"

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Últimos pedidos</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pedidos" />}>
            Ver todos
            <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Sin pedidos en este rango"
            description="Ajusta el rango de fechas para ver actividad."
            className="mx-4 border-0"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/pedidos/${order.id}`} className="hover:text-copper hover:underline">
                      {order.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-40 truncate">{order.buyerName}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge meta={orderStatusMeta[order.status]} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={order.total} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
