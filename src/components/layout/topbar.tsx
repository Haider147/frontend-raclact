"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Bell,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  SunMoon,
  User,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { getBreadcrumbs, navGroupsForRole } from "@/components/layout/nav-config"
import { usePanelRole } from "@/components/providers/panel-role-provider"
import { panelRoleMeta } from "@/lib/panel-role"
import { formatRelative } from "@/lib/format"
import { notifications as initialNotifications } from "@/mocks/notifications"

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = usePanelRole()
  const crumbs = useMemo(() => getBreadcrumbs(pathname), [pathname])
  const visibleNavGroups = useMemo(() => navGroupsForRole(role), [role])

  const [commandOpen, setCommandOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((n) => !n.readAt).length

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function goTo(href: string) {
    setCommandOpen(false)
    router.push(href)
  }

  function markAllRead() {
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-sm sm:px-5">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap overflow-hidden">
          {crumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {i === crumbs.length - 1 ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />} className="truncate">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden text-muted-foreground sm:inline-flex"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-3.5" strokeWidth={1.75} />
          Buscar…
          <KbdGroup className="ml-2">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden"
          aria-label="Buscar"
          onClick={() => setCommandOpen(true)}
        >
          <Search strokeWidth={1.75} />
        </Button>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Notificaciones" className="relative" />
            }
          >
            <Bell strokeWidth={1.75} />
            {unreadCount > 0 ? (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
                {unreadCount}
              </Badge>
            ) : null}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <p className="font-heading text-sm font-semibold text-navy dark:text-cream">
                Notificaciones
              </p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-copper hover:underline"
                >
                  Marcar todas como leídas
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="Sin notificaciones"
                  description="Aquí verás la actividad reciente del panel."
                  className="border-0 py-10"
                />
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href ?? "#"}
                    className="flex gap-2.5 border-b border-border/60 px-3 py-2.5 text-sm last:border-0 hover:bg-muted/60"
                  >
                    <span
                      className={
                        "mt-1.5 size-1.5 shrink-0 rounded-full " +
                        (n.readAt ? "bg-transparent" : "bg-copper")
                      }
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-medium text-foreground">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="text-[11px] text-muted-foreground/80">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ThemeMenu />

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <UserMenu />
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command>
          <CommandInput placeholder="Buscar páginas del panel…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            {visibleNavGroups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${group.label} ${item.label}`}
                    onSelect={() => goTo(item.href)}
                  >
                    <item.icon className="size-4" strokeWidth={1.75} />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  )
}

function ThemeMenu() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Cambiar tema" />}
      >
        <SunMoon strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" strokeWidth={1.75} />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" strokeWidth={1.75} />
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <SunMoon className="size-4" strokeWidth={1.75} />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  const { role } = usePanelRole()
  const meta = panelRoleMeta[role]
  const initials = meta.displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Cuenta" className="rounded-full" />}
      >
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0 py-1.5">
            <span className="text-sm font-medium text-foreground">{meta.displayName}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {meta.label} · {meta.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/ajustes" />}>
          <User className="size-4" strokeWidth={1.75} />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/ajustes" />}>
          <Settings className="size-4" strokeWidth={1.75} />
          Ajustes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" render={<Link href="/login" />}>
          <LogOut className="size-4" strokeWidth={1.75} />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
