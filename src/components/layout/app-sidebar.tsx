"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navGroups, navGroupsForRole, type NavItem } from "@/components/layout/nav-config"
import { usePanelRole } from "@/components/providers/panel-role-provider"

const allItems: NavItem[] = navGroups.flatMap((group) => group.items)

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  const candidates = allItems.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  if (candidates.length === 0) return false
  const longest = candidates.reduce((a, b) => (b.href.length > a.href.length ? b : a))
  return longest.href === href
}

export function AppSidebar() {
  const pathname = usePathname()
  const { role } = usePanelRole()
  const groups = navGroupsForRole(role)

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="gap-3 px-3 py-4">
        <Link href="/" className="flex items-center gap-3 px-1">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-navy">
            RL
          </span>
          <span className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-sm font-bold tracking-wide text-cream uppercase">
              RacLact
            </span>
            <span className="text-[11px] text-cream/60">Panel administrativo</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-cream/50">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActiveHref(pathname, item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                        className={
                          active
                            ? "border-l-[3px] border-l-copper pl-[5px]"
                            : "border-l-[3px] border-l-transparent"
                        }
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.comingSoon ? (
                        <SidebarMenuBadge className="text-cream/50">Próx.</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
