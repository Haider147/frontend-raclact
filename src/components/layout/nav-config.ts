import {
  BarChart3,
  Boxes,
  ClipboardList,
  FlaskConical,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  Percent,
  ReceiptText,
  Settings,
  ShoppingBasket,
  Star,
  Tags,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"
import { PANEL_ROLES, type PanelRole } from "@/lib/panel-role"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
  /** Roles del panel que ven este ítem en la sidebar. Por defecto, todos. */
  roles?: PanelRole[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Operación",
    items: [
      { label: "Pedidos", href: "/pedidos", icon: ClipboardList, roles: ["ADMIN", "COMERCIAL"] },
      {
        label: "Producción",
        href: "/produccion",
        icon: FlaskConical,
        comingSoon: true,
        roles: ["ADMIN", "PLANTA"],
      },
      { label: "Inventario", href: "/inventario", icon: Boxes, roles: ["ADMIN", "PLANTA"] },
      { label: "Compras", href: "/compras", icon: ShoppingBasket, comingSoon: true, roles: ["ADMIN", "PLANTA"] },
      {
        label: "Facturación",
        href: "/facturacion",
        icon: ReceiptText,
        comingSoon: true,
        roles: ["ADMIN", "COMERCIAL"],
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Productos", href: "/productos", icon: Package, roles: ["ADMIN", "COMERCIAL"] },
      { label: "Categorías", href: "/productos/categorias", icon: Tags, roles: ["ADMIN", "COMERCIAL"] },
      { label: "Envíos", href: "/envios", icon: Truck, roles: ["ADMIN", "COMERCIAL"] },
      { label: "Descuentos", href: "/descuentos", icon: Percent, roles: ["ADMIN", "COMERCIAL"] },
      { label: "Archivos", href: "/archivos", icon: ImageIcon, roles: ["ADMIN", "COMERCIAL"] },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { label: "Clientes", href: "/clientes", icon: Users, roles: ["ADMIN", "COMERCIAL"] },
      { label: "Reseñas", href: "/resenas", icon: Star, roles: ["ADMIN", "COMERCIAL"] },
    ],
  },
  {
    label: "Análisis",
    items: [{ label: "Reportes", href: "/reportes", icon: BarChart3, roles: ["ADMIN", "COMERCIAL"] }],
  },
  {
    label: "Sistema",
    items: [{ label: "Ajustes", href: "/ajustes", icon: Settings, roles: PANEL_ROLES }],
  },
]

export function navGroupsForRole(role: PanelRole): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => (item.roles ?? PANEL_ROLES).includes(role)),
    }))
    .filter((group) => group.items.length > 0)
}

export interface Breadcrumb {
  label: string
  href: string
}

function humanizeSegment(segment: string): string {
  if (/^[a-f0-9-]{8,}$/i.test(segment)) return segment
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/** Resuelve las migas de pan a partir del pathname, usando la etiqueta del ítem de
 * navegación cuando existe y humanizando el resto (rutas nuevas/[id] sin ítem propio). */
export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }]

  const segments = pathname.split("/").filter(Boolean)
  const crumbs: Breadcrumb[] = []
  const flatItems = navGroups.flatMap((group) => group.items)
  let acc = ""

  for (const segment of segments) {
    acc += `/${segment}`
    const match = flatItems.find((item) => item.href === acc)
    crumbs.push({ label: match?.label ?? humanizeSegment(segment), href: acc })
  }

  return crumbs
}
