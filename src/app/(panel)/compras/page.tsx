import Link from "next/link"
import { ClipboardList, Package, Truck } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { suppliers, purchaseOrders, rawMaterials } from "@/mocks/purchasing"

const sections = [
  { href: "/compras/proveedores", icon: Truck, label: "Proveedores", description: "Contactos, insumos y plazos de entrega." },
  { href: "/compras/ordenes", icon: ClipboardList, label: "Órdenes de compra", description: "Seguimiento de pedidos a proveedores." },
  { href: "/compras/insumos", icon: Package, label: "Insumos", description: "Materias primas y empaques con punto de reposición." },
]

export default function ComprasPage() {
  const counts = { proveedores: suppliers.length, ordenes: purchaseOrders.length, insumos: rawMaterials.length }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras y proveedores"
        description="Abastecimiento de materias primas y empaques para la planta."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:border-copper/40">
              <CardContent className="space-y-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-navy dark:text-cream">
                  <section.icon className="size-4.5" strokeWidth={1.75} />
                </span>
                <p className="font-heading text-sm font-semibold text-navy dark:text-cream">{section.label}</p>
                <p className="text-xs text-muted-foreground">{section.description}</p>
                <p className="text-xs font-medium text-copper">
                  {section.href === "/compras/proveedores"
                    ? counts.proveedores
                    : section.href === "/compras/ordenes"
                      ? counts.ordenes
                      : counts.insumos}{" "}
                  registros
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
