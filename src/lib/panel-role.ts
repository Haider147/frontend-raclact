// Roles del panel administrativo — un recorte propio de la maqueta, independiente del
// Role del contrato del backend (CUSTOMER | ADMIN, ver src/types/enums.ts). Los tres
// roles de aquí solo deciden qué ve cada persona en la sidebar del panel; no hay
// autenticación ni permisos reales detrás.

export type PanelRole = "ADMIN" | "PLANTA" | "COMERCIAL"

export const PANEL_ROLES: PanelRole[] = ["ADMIN", "PLANTA", "COMERCIAL"]

export interface PanelRoleMeta {
  label: string
  description: string
  displayName: string
  email: string
}

export const panelRoleMeta: Record<PanelRole, PanelRoleMeta> = {
  ADMIN: {
    label: "Administrador",
    description: "Acceso completo al panel",
    displayName: "Ana Restrepo",
    email: "ana.restrepo@raclact.co",
  },
  PLANTA: {
    label: "Planta",
    description: "Producción, inventario y compras",
    displayName: "Diana Marcela Osorio",
    email: "diana.osorio@raclact.co",
  },
  COMERCIAL: {
    label: "Comercial",
    description: "Pedidos, catálogo, clientes y reportes",
    displayName: "Jorge Iván Gómez",
    email: "jorge.gomez@raclact.co",
  },
}

export const DEFAULT_PANEL_ROLE: PanelRole = "ADMIN"

export function isPanelRole(value: string | null): value is PanelRole {
  return value === "ADMIN" || value === "PLANTA" || value === "COMERCIAL"
}
