// Módulo futuro — no existe en raclact-backend. Formalizarlo exigirá modelos nuevos
// en schema.prisma (ProductionBatch, ProcessReading, QualityTest, ProductionRun...)
// y ampliar el enum Role (p. ej. sumar PRODUCTION).

import type { BatchRoute, BatchStatus } from "./enums"
import type { IsoDateTime } from "./common"

export type ProcessStageKey =
  | "RECEPCION"
  | "PASTEURIZACION"
  | "ENFRIAMIENTO_INOCULACION"
  | "FERMENTACION"
  | "BATIDO_HOMOGENEIZACION"
  | "ADICION_SABORES"
  | "ENVASADO"
  | "REFRIGERACION"
  | "ALMACENAMIENTO"

export type ProcessStageState = "COMPLETADA" | "ACTUAL" | "PENDIENTE" | "NO_APLICA"

export interface ProcessStage {
  key: ProcessStageKey
  label: string
  state: ProcessStageState
  /** Solo para las rutas de fermentación, que bifurcan yogur/kumis. */
  route?: BatchRoute
  startedAt: IsoDateTime | null
  completedAt: IsoDateTime | null
}

export interface ProcessVariableReading {
  timestamp: IsoDateTime
  value: number
}

export interface ProcessVariable {
  key: "temperatura" | "tiempo" | "ph" | "flujo" | "mezclado" | "dosificacion"
  label: string
  unit: string
  currentValue: number
  targetMin: number
  targetMax: number
  history: ProcessVariableReading[]
}

export interface ProductionBatch {
  id: string
  code: string
  productName: string
  route: BatchRoute
  volumeLiters: number
  status: BatchStatus
  currentStageKey: ProcessStageKey
  responsibleName: string
  line: string
  stages: ProcessStage[]
  variables: ProcessVariable[]
  startedAt: IsoDateTime
  estimatedEndAt: IsoDateTime | null
}

export interface QualityTest {
  id: string
  batchId: string
  batchCode: string
  performedAt: IsoDateTime
  ph: number
  acidity: number
  temperatureC: number
  sensoryNotes: string | null
  withinRange: boolean
  released: boolean
  performedByName: string
}

export interface ProductionRunPlan {
  id: string
  line: string
  batchCode: string
  productName: string
  route: BatchRoute
  scheduledStart: IsoDateTime
  scheduledEnd: IsoDateTime
  volumeLiters: number
}

export interface RawMaterialConsumptionEstimate {
  inputName: string
  unit: string
  estimatedQuantity: number
}
