"use client"

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react"
import { DEFAULT_PANEL_ROLE, isPanelRole, type PanelRole } from "@/lib/panel-role"

const STORAGE_KEY = "raclact_panel_role"

let cachedRole: PanelRole | null = null
const listeners = new Set<() => void>()

function readStoredRole(): PanelRole {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isPanelRole(stored) ? stored : DEFAULT_PANEL_ROLE
  } catch {
    return DEFAULT_PANEL_ROLE
  }
}

function getSnapshot(): PanelRole {
  if (cachedRole === null) cachedRole = readStoredRole()
  return cachedRole
}

function getServerSnapshot(): PanelRole {
  return DEFAULT_PANEL_ROLE
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function writeRole(next: PanelRole): void {
  cachedRole = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // localStorage no disponible (modo privado, etc.) — el rol sigue en memoria.
  }
  listeners.forEach((listener) => listener())
}

interface PanelRoleContextValue {
  role: PanelRole
  setRole: (role: PanelRole) => void
}

const PanelRoleContext = createContext<PanelRoleContextValue | null>(null)

export function PanelRoleProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return <PanelRoleContext.Provider value={{ role, setRole: writeRole }}>{children}</PanelRoleContext.Provider>
}

export function usePanelRole(): PanelRoleContextValue {
  const context = useContext(PanelRoleContext)
  if (!context) throw new Error("usePanelRole debe usarse dentro de <PanelRoleProvider>.")
  return context
}
