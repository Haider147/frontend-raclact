"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { BadgeCheck, MoreHorizontal, Users } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumnDef } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { customers as initialCustomers } from "@/mocks/customers"
import { accountStatusMeta, getAccountStatus, roleMeta } from "@/lib/status"
import { formatDate } from "@/lib/format"
import type { Role, User } from "@/types"

function columns(onAction: (user: User, action: string) => void): DataTableColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <Link href={`/clientes/${row.original.id}`} className="font-medium hover:text-copper hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "email", header: "Correo" },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => <StatusBadge meta={roleMeta[row.original.role]} />,
    },
    {
      id: "verified",
      header: "Verificado",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.emailVerifiedAt ? (
          <BadgeCheck className="size-4 text-success" strokeWidth={1.75} />
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        ),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => <StatusBadge meta={accountStatusMeta[getAccountStatus(row.original)]} />,
    },
    {
      accessorKey: "createdAt",
      header: "Registro",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const status = getAccountStatus(row.original)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Acciones" />}>
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onAction(row.original, row.original.role === "ADMIN" ? "role:CUSTOMER" : "role:ADMIN")}
              >
                Cambiar a {row.original.role === "ADMIN" ? "Cliente" : "Administrador"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {status === "LOCKED" ? (
                <DropdownMenuItem onClick={() => onAction(row.original, "unlock")}>Desbloquear</DropdownMenuItem>
              ) : null}
              {status === "DEACTIVATED" ? (
                <DropdownMenuItem onClick={() => onAction(row.original, "reactivate")}>Reactivar</DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" onClick={() => onAction(row.original, "deactivate")}>
                  Dar de baja
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export default function ClientesPage() {
  const [users, setUsers] = useState<User[]>(initialCustomers)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<Role | "ALL">("ALL")
  const [includeDeactivated, setIncludeDeactivated] = useState(false)

  function handleAction(user: User, action: string) {
    const admins = users.filter((u) => u.role === "ADMIN")
    if (action === "role:CUSTOMER" && admins.length <= 1 && user.role === "ADMIN") {
      toast.error("No puedes quitar el rol al último administrador")
      return
    }
    if (action === "deactivate" && admins.length <= 1 && user.role === "ADMIN") {
      toast.error("No puedes dar de baja al último administrador")
      return
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== user.id) return u
        if (action.startsWith("role:")) return { ...u, role: action.split(":")[1] as Role }
        if (action === "unlock") return { ...u, lockedAt: null }
        if (action === "deactivate") return { ...u, deactivatedAt: new Date().toISOString() }
        if (action === "reactivate") return { ...u, deactivatedAt: null }
        return u
      })
    )
    toast.success(`${user.name}: acción aplicada`)
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter((u) => {
      if (role !== "ALL" && u.role !== role) return false
      if (!includeDeactivated && u.deactivatedAt) return false
      if (term && !u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term)) return false
      return true
    })
  }, [users, search, role, includeDeactivated])

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Usuarios registrados en la tienda de RacLact." />

      <DataTable
        columns={columns(handleAction)}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o correo…"
        filters={
          <>
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value as Role | "ALL")} className="w-44">
              <NativeSelectOption value="ALL">Todos los roles</NativeSelectOption>
              <NativeSelectOption value="CUSTOMER">Cliente</NativeSelectOption>
              <NativeSelectOption value="ADMIN">Administrador</NativeSelectOption>
            </NativeSelect>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={includeDeactivated} onCheckedChange={(v) => setIncludeDeactivated(!!v)} />
              Incluir dados de baja
            </label>
          </>
        }
        emptyState={
          <EmptyState icon={Users} title="Sin clientes" description="No hay clientes con estos filtros." className="border-0 py-16" />
        }
      />
    </div>
  )
}
