// Lógica pura del flujo de producción — sin "use client" a propósito, para que tanto
// componentes de cliente (el diagrama interactivo) como de servidor (el tablero de
// /produccion) puedan importar STAGE_ORDER/progressIndex sin cruzar el límite RSC.

import type { BatchRoute, ProcessStage, ProcessStageKey } from "@/types"

export const STAGE_ORDER: ProcessStageKey[] = [
  "RECEPCION",
  "PASTEURIZACION",
  "ENFRIAMIENTO_INOCULACION",
  "FERMENTACION",
  "BATIDO_HOMOGENEIZACION",
  "ADICION_SABORES",
  "ENVASADO",
  "REFRIGERACION",
  "ALMACENAMIENTO",
]

export interface StageMeta {
  title: [string, string?]
  detail: (route: BatchRoute) => string
}

export const STAGE_META: Record<ProcessStageKey, StageMeta> = {
  RECEPCION: { title: ["Recepción", "y control"], detail: () => "Filtrado y control de calidad de la leche cruda." },
  PASTEURIZACION: { title: ["Pasteurización"], detail: () => "85–90 °C · 15–30 min." },
  ENFRIAMIENTO_INOCULACION: {
    title: ["Enfriamiento", "e inoculación"],
    detail: () => "Se enfría la mezcla y se inoculan los cultivos.",
  },
  FERMENTACION: {
    title: ["Fermentación"],
    detail: (route) =>
      route === "YOGUR" ? "42–45 °C · 4–6 h · pH 4.5–4.6" : "22–28 °C · 12–18 h · pH 4.2–4.4",
  },
  BATIDO_HOMOGENEIZACION: {
    title: ["Batido y", "homogeneización"],
    detail: () => "Enfriamiento, batido y homogeneización del producto fermentado.",
  },
  ADICION_SABORES: {
    title: ["Adición de", "sabores"],
    detail: () => "Solo en la ruta yogur — fresa, melocotón o mora.",
  },
  ENVASADO: { title: ["Envasado", "y sellado"], detail: () => "Presentaciones de 1 L y 250 mL." },
  REFRIGERACION: { title: ["Refrigeración", "final"], detail: () => "2–4 °C." },
  ALMACENAMIENTO: { title: ["Almacenamiento", "y distribución"], detail: () => "Listo para despacho." },
}

/** Índice (0-8) de la etapa más avanzada alcanzada — -1 si el lote no ha empezado. */
export function progressIndex(stages: ProcessStage[]): number {
  const byKey = new Map(stages.map((s) => [s.key, s]))
  const actual = STAGE_ORDER.findIndex((k) => byKey.get(k)?.state === "ACTUAL")
  if (actual !== -1) return actual
  let last = -1
  STAGE_ORDER.forEach((k, i) => {
    if (byKey.get(k)?.state === "COMPLETADA") last = i
  })
  return last
}
