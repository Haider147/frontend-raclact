// Módulo futuro — no existe en raclact-backend (ver comentario en src/types/production.ts).
// Los responsables de planta aquí son datos de la maqueta, no usuarios reales del sistema.

import type {
  BatchRoute,
  BatchStatus,
  ProcessStage,
  ProcessStageKey,
  ProcessVariable,
  ProductionBatch,
  ProductionRunPlan,
  QualityTest,
  RawMaterialConsumptionEstimate,
} from "@/types"
import { createRng, daysAgo, pick, randInt } from "@/mocks/rng"

const rng = createRng(7788)

const STAGE_ORDER: ProcessStageKey[] = [
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

const STAGE_LABELS: Record<ProcessStageKey, string> = {
  RECEPCION: "Recepción y control de calidad",
  PASTEURIZACION: "Pasteurización",
  ENFRIAMIENTO_INOCULACION: "Enfriamiento e inoculación",
  FERMENTACION: "Fermentación",
  BATIDO_HOMOGENEIZACION: "Batido y homogeneización",
  ADICION_SABORES: "Adición de sabores",
  ENVASADO: "Envasado y sellado",
  REFRIGERACION: "Refrigeración final",
  ALMACENAMIENTO: "Almacenamiento y distribución",
}

const RESPONSABLES = ["Diana Marcela Osorio", "Fabián Castrillón", "Yesenia Palacios", "Rodrigo Montoya"]
const LINES = ["Línea 1", "Línea 2"]

function buildStages(route: BatchRoute, completedCount: number, startedAt: Date): ProcessStage[] {
  return STAGE_ORDER.map((key, i) => {
    if (key === "ADICION_SABORES" && route === "KUMIS") {
      return { key, label: STAGE_LABELS[key], state: "NO_APLICA", route: undefined, startedAt: null, completedAt: null }
    }
    const stageRoute = key === "FERMENTACION" ? route : undefined
    if (i < completedCount) {
      const started = daysAgo(rng, 0)
      started.setTime(startedAt.getTime() + i * 45 * 60 * 1000)
      const completed = new Date(started.getTime() + 40 * 60 * 1000)
      return { key, label: STAGE_LABELS[key], state: "COMPLETADA", route: stageRoute, startedAt: started.toISOString(), completedAt: completed.toISOString() }
    }
    if (i === completedCount) {
      const started = new Date(startedAt.getTime() + i * 45 * 60 * 1000)
      return { key, label: STAGE_LABELS[key], state: "ACTUAL", route: stageRoute, startedAt: started.toISOString(), completedAt: null }
    }
    return { key, label: STAGE_LABELS[key], state: "PENDIENTE", route: stageRoute, startedAt: null, completedAt: null }
  })
}

function buildVariable(
  key: ProcessVariable["key"],
  label: string,
  unit: string,
  target: [number, number],
  current: number
): ProcessVariable {
  const history = Array.from({ length: 12 }, (_, i) => ({
    timestamp: daysAgo(rng, 0.5 - i * 0.03).toISOString(),
    value: Math.round((current + (rng() - 0.5) * (target[1] - target[0]) * 0.3) * 10) / 10,
  })).reverse()
  return { key, label, unit, currentValue: current, targetMin: target[0], targetMax: target[1], history }
}

function buildVariables(route: BatchRoute, currentStageKey: ProcessStageKey): ProcessVariable[] {
  const isFermenting = currentStageKey === "FERMENTACION"
  const tempTarget: [number, number] = route === "YOGUR" ? [42, 45] : [22, 28]
  const phTarget: [number, number] = route === "YOGUR" ? [4.5, 4.6] : [4.2, 4.4]
  const temp = isFermenting ? tempTarget[0] + rng() * (tempTarget[1] - tempTarget[0]) : 6 + rng() * 2
  const ph = isFermenting ? phTarget[0] + rng() * (phTarget[1] - phTarget[0]) : 6.6 + rng() * 0.3

  return [
    buildVariable("temperatura", "Temperatura", "°C", isFermenting ? tempTarget : [4, 8], Math.round(temp * 10) / 10),
    buildVariable("tiempo", "Tiempo en etapa", "min", [30, 60], randInt(rng, 20, 70)),
    buildVariable("ph", "pH", "", isFermenting ? phTarget : [6.4, 6.8], Math.round(ph * 100) / 100),
    buildVariable("flujo", "Flujo", "L/min", [80, 120], randInt(rng, 60, 140)),
    buildVariable("mezclado", "Velocidad de mezclado", "rpm", [40, 80], randInt(rng, 30, 90)),
    buildVariable("dosificacion", "Dosificación de cultivo", "%", [0.8, 1.2], Math.round((0.8 + rng() * 0.4) * 100) / 100),
  ]
}

interface BatchSeed {
  code: string
  productName: string
  route: BatchRoute
  status: BatchStatus
  completedCount: number
  daysAgoStarted: number
}

const seeds: BatchSeed[] = [
  { code: "LT-2609-01", productName: "Kumis Tradicional", route: "KUMIS", status: "LIBERADO", completedCount: 9, daysAgoStarted: 6 },
  { code: "LT-2609-02", productName: "Yogur de Sabores — Fresa", route: "YOGUR", status: "LIBERADO", completedCount: 9, daysAgoStarted: 6 },
  { code: "LT-2609-03", productName: "Yogur de Sabores — Mora", route: "YOGUR", status: "LIBERADO", completedCount: 9, daysAgoStarted: 5 },
  { code: "LT-2609-04", productName: "Kumis Tradicional", route: "KUMIS", status: "LIBERADO", completedCount: 9, daysAgoStarted: 5 },
  { code: "LT-2609-05", productName: "Yogur de Sabores — Melocotón", route: "YOGUR", status: "RECHAZADO", completedCount: 6, daysAgoStarted: 4 },
  { code: "LT-2609-06", productName: "Kumis Tradicional", route: "KUMIS", status: "ENVASADO", completedCount: 7, daysAgoStarted: 2 },
  { code: "LT-2609-07", productName: "Yogur de Sabores — Fresa", route: "YOGUR", status: "ENVASADO", completedCount: 6, daysAgoStarted: 2 },
  { code: "LT-2609-08", productName: "Yogur de Sabores — Mora", route: "YOGUR", status: "FERMENTACION", completedCount: 3, daysAgoStarted: 1 },
  { code: "LT-2609-09", productName: "Kumis Tradicional", route: "KUMIS", status: "FERMENTACION", completedCount: 3, daysAgoStarted: 1 },
  { code: "LT-2609-10", productName: "Yogur de Sabores — Melocotón", route: "YOGUR", status: "EN_PROCESO", completedCount: 1, daysAgoStarted: 0.4 },
  { code: "LT-2609-11", productName: "Kumis Tradicional", route: "KUMIS", status: "EN_PROCESO", completedCount: 2, daysAgoStarted: 0.3 },
  { code: "LT-2609-12", productName: "Yogur de Sabores — Fresa", route: "YOGUR", status: "PLANIFICADO", completedCount: 0, daysAgoStarted: -1 },
  { code: "LT-2609-13", productName: "Kumis Tradicional", route: "KUMIS", status: "PLANIFICADO", completedCount: 0, daysAgoStarted: -2 },
]

export const productionBatches: ProductionBatch[] = seeds.map((seed, i) => {
  const startedAt = daysAgo(rng, seed.daysAgoStarted)
  const applicableStages = STAGE_ORDER.filter((k) => !(k === "ADICION_SABORES" && seed.route === "KUMIS"))
  const stages = buildStages(seed.route, seed.completedCount, startedAt)
  const currentStage = stages.find((s) => s.state === "ACTUAL") ?? stages[stages.length - 1]

  return {
    id: `batch_${i + 1}`,
    code: seed.code,
    productName: seed.productName,
    route: seed.route,
    volumeLiters: randInt(rng, 800, 2400),
    status: seed.status,
    currentStageKey: currentStage.key,
    responsibleName: pick(rng, RESPONSABLES),
    line: pick(rng, LINES),
    stages,
    variables: buildVariables(seed.route, currentStage.key),
    startedAt: startedAt.toISOString(),
    estimatedEndAt:
      seed.status === "LIBERADO" || seed.status === "RECHAZADO"
        ? null
        : new Date(startedAt.getTime() + applicableStages.length * 50 * 60 * 1000).toISOString(),
  } satisfies ProductionBatch
})

export const qualityTests: QualityTest[] = productionBatches
  .filter((b) => b.status === "LIBERADO" || b.status === "RECHAZADO" || b.status === "ENVASADO")
  .map((batch, i) => {
    const withinRange = batch.status !== "RECHAZADO"
    const phTarget = batch.route === "YOGUR" ? [4.5, 4.6] : [4.2, 4.4]
    return {
      id: `qt_${i + 1}`,
      batchId: batch.id,
      batchCode: batch.code,
      performedAt: daysAgo(rng, randInt(rng, 0, 5)).toISOString(),
      ph: withinRange
        ? Math.round((phTarget[0] + rng() * (phTarget[1] - phTarget[0])) * 100) / 100
        : Math.round((phTarget[1] + 0.3 + rng() * 0.2) * 100) / 100,
      acidity: Math.round((0.6 + rng() * 0.4) * 100) / 100,
      temperatureC: Math.round((4 + rng() * 3) * 10) / 10,
      sensoryNotes: withinRange ? "Textura y sabor conformes con la ficha del producto." : "Acidez fuera de rango — sabor residual amargo.",
      withinRange,
      released: batch.status === "LIBERADO",
      performedByName: pick(rng, RESPONSABLES),
    } satisfies QualityTest
  })

export const productionPlan: ProductionRunPlan[] = Array.from({ length: 8 }, (_, i) => {
  const route: BatchRoute = i % 2 === 0 ? "YOGUR" : "KUMIS"
  const scheduledStart = daysAgo(rng, -randInt(rng, 1, 12))
  return {
    id: `plan_${i + 1}`,
    line: pick(rng, LINES),
    batchCode: `LT-2609-${14 + i}`,
    productName: route === "YOGUR" ? "Yogur de Sabores" : "Kumis Tradicional",
    route,
    scheduledStart: scheduledStart.toISOString(),
    scheduledEnd: new Date(scheduledStart.getTime() + 6 * 60 * 60 * 1000).toISOString(),
    volumeLiters: randInt(rng, 800, 2000),
  } satisfies ProductionRunPlan
})

export const rawMaterialConsumption: RawMaterialConsumptionEstimate[] = [
  { inputName: "Leche cruda entera", unit: "L", estimatedQuantity: 14200 },
  { inputName: "Cultivo yogur (S. thermophilus + L. bulgaricus)", unit: "g", estimatedQuantity: 420 },
  { inputName: "Cultivo kumis (lácticas + levaduras)", unit: "g", estimatedQuantity: 310 },
  { inputName: "Preparado de fruta — fresa", unit: "kg", estimatedQuantity: 180 },
  { inputName: "Preparado de fruta — melocotón", unit: "kg", estimatedQuantity: 140 },
  { inputName: "Preparado de fruta — mora", unit: "kg", estimatedQuantity: 160 },
  { inputName: "Endulzante", unit: "kg", estimatedQuantity: 95 },
  { inputName: "Envase 1 L", unit: "unidades", estimatedQuantity: 3200 },
  { inputName: "Envase 250 ml", unit: "unidades", estimatedQuantity: 6400 },
]
