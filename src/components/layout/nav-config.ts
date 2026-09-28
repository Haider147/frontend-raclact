import { LayoutDashboard, type LucideIcon } from "lucide-react"
import { PANEL_ROLES, type Role } from "@/lib/session"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
  /** Roles que ven este ítem en la sidebar. Por defecto, todos los del panel. */
  roles?: Role[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [{ label: "Inicio", href: "/", icon: LayoutDashboard }],
  },
]

export function navGroupsForRole(role: Role): NavGroup[] {
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
  if (pathname === "/") return [{ label: "Inicio", href: "/" }]

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
