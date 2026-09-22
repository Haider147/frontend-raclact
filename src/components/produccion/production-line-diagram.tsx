"use client"

import { useId } from "react"
import Image from "next/image"
import {
  Blend,
  Candy,
  Cherry,
  Clock,
  Droplets,
  Gauge,
  Milk,
  Recycle,
  TestTube,
  Thermometer,
  type LucideIcon,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { STAGE_META, STAGE_ORDER, progressIndex } from "@/lib/production-flow"
import type { BatchRoute, ProcessStage, ProcessStageKey, ProductionBatch } from "@/types"

/**
 * Recreación interactiva del "Diagrama general del proceso" del material de marca
 * (ver RacLact.pdf, sección Diagrama general del proceso) — dos filas en zigzag,
 * bifurcación Yogur/Kumis como dos carriles separados (nunca líneas diagonales que se
 * crucen) y zonas de Entradas/Salida a los costados, igual que el original.
 */

const ENTRADAS = [
  { label: "Leche cruda", icon: Milk },
  { label: "Cultivos", icon: TestTube },
  { label: "Fruta natural", icon: Cherry },
  { label: "Endulzante", icon: Candy },
  { label: "Envases biodegradables", icon: Recycle },
]

const SALIDA = [
  { label: "Kumis tradicional", image: "/products/kumis.svg" },
  { label: "Yogur de sabores", image: "/products/yogur-fresa.svg" },
]

const VARIABLES: { label: string; icon: LucideIcon }[] = [
  { label: "Temperatura", icon: Thermometer },
  { label: "Tiempo", icon: Clock },
  { label: "pH", icon: TestTube },
  { label: "Flujo", icon: Gauge },
  { label: "Mezclado", icon: Blend },
  { label: "Dosificación", icon: Droplets },
]

// --- Geometría del diagrama (coordenadas fijas, todo en ángulo recto — nada de
// diagonales que se crucen entre sí). ---
const W = 140
const H = 60
const FORK_H = 54
const ROW1_Y = 90
const ROW1_CY = ROW1_Y + H / 2 // 120
const ROW2_Y = 300
const ROW2_CY = ROW2_Y + H / 2 // 330
const YOGUR_Y = 23
const YOGUR_CY = YOGUR_Y + FORK_H / 2 // 50
const KUMIS_Y = 163
const KUMIS_CY = KUMIS_Y + FORK_H / 2 // 190

const X = {
  recepcion: 196,
  pasteurizacion: 366,
  enfriamiento: 536,
  forkBar: 706,
  fork: 716,
  mergeBar: 866,
  homogeneizacion: 886,
  adicion: 260,
  envasado: 430,
  refrigeracion: 600,
  almacenamiento: 770,
}

const VIEW_W = 1220
const VIEW_H = 460

interface NodeSpec {
  key: ProcessStageKey
  x: number
  y: number
  w: number
  h: number
  route?: BatchRoute
}

const NODES: NodeSpec[] = [
  { key: "RECEPCION", x: X.recepcion, y: ROW1_Y, w: W, h: H },
  { key: "PASTEURIZACION", x: X.pasteurizacion, y: ROW1_Y, w: W, h: H },
  { key: "ENFRIAMIENTO_INOCULACION", x: X.enfriamiento, y: ROW1_Y, w: W, h: H },
  { key: "FERMENTACION", x: X.fork, y: YOGUR_Y, w: W, h: FORK_H, route: "YOGUR" },
  { key: "FERMENTACION", x: X.fork, y: KUMIS_Y, w: W, h: FORK_H, route: "KUMIS" },
  { key: "BATIDO_HOMOGENEIZACION", x: X.homogeneizacion, y: ROW1_Y, w: W, h: H },
  { key: "ADICION_SABORES", x: X.adicion, y: ROW2_Y, w: W, h: H },
  { key: "ENVASADO", x: X.envasado, y: ROW2_Y, w: W, h: H },
  { key: "REFRIGERACION", x: X.refrigeracion, y: ROW2_Y, w: W, h: H },
  { key: "ALMACENAMIENTO", x: X.almacenamiento, y: ROW2_Y, w: W, h: H },
]

interface Segment {
  id: string
  points: [number, number][]
  /** Índice en STAGE_ORDER del nodo al que entra este tramo. */
  targetIndex: number
  /** Si el tramo pertenece a un carril de ruta, solo se activa para esa ruta. */
  onlyRoute?: BatchRoute
  arrow?: boolean
}

const IDX = Object.fromEntries(STAGE_ORDER.map((k, i) => [k, i])) as Record<ProcessStageKey, number>

const SEGMENTS: Segment[] = [
  { id: "entradas-recepcion", points: [[168, ROW1_CY], [X.recepcion, ROW1_CY]], targetIndex: IDX.RECEPCION, arrow: true },
  { id: "recepcion-pasteurizacion", points: [[X.recepcion + W, ROW1_CY], [X.pasteurizacion, ROW1_CY]], targetIndex: IDX.PASTEURIZACION, arrow: true },
  { id: "pasteurizacion-enfriamiento", points: [[X.pasteurizacion + W, ROW1_CY], [X.enfriamiento, ROW1_CY]], targetIndex: IDX.ENFRIAMIENTO_INOCULACION, arrow: true },
  { id: "enfriamiento-forkbar", points: [[X.enfriamiento + W, ROW1_CY], [X.forkBar, ROW1_CY]], targetIndex: IDX.FERMENTACION },
  { id: "forkbar-vertical", points: [[X.forkBar, YOGUR_CY], [X.forkBar, KUMIS_CY]], targetIndex: IDX.FERMENTACION },
  { id: "forkbar-yogur", points: [[X.forkBar, YOGUR_CY], [X.fork, YOGUR_CY]], targetIndex: IDX.FERMENTACION, onlyRoute: "YOGUR", arrow: true },
  { id: "forkbar-kumis", points: [[X.forkBar, KUMIS_CY], [X.fork, KUMIS_CY]], targetIndex: IDX.FERMENTACION, onlyRoute: "KUMIS", arrow: true },
  { id: "yogur-mergebar", points: [[X.fork + W, YOGUR_CY], [X.mergeBar, YOGUR_CY]], targetIndex: IDX.BATIDO_HOMOGENEIZACION, onlyRoute: "YOGUR" },
  { id: "kumis-mergebar", points: [[X.fork + W, KUMIS_CY], [X.mergeBar, KUMIS_CY]], targetIndex: IDX.BATIDO_HOMOGENEIZACION, onlyRoute: "KUMIS" },
  { id: "mergebar-vertical", points: [[X.mergeBar, YOGUR_CY], [X.mergeBar, KUMIS_CY]], targetIndex: IDX.BATIDO_HOMOGENEIZACION },
  { id: "mergebar-homogeneizacion", points: [[X.mergeBar, ROW1_CY], [X.homogeneizacion, ROW1_CY]], targetIndex: IDX.BATIDO_HOMOGENEIZACION, arrow: true },
  {
    id: "homogeneizacion-drop",
    points: [
      [X.homogeneizacion + W / 2, ROW1_Y + H],
      [X.homogeneizacion + W / 2, 230],
      [X.adicion + W / 2, 230],
      [X.adicion + W / 2, ROW2_Y],
    ],
    targetIndex: IDX.ADICION_SABORES,
    arrow: true,
  },
  { id: "adicion-envasado", points: [[X.adicion + W, ROW2_CY], [X.envasado, ROW2_CY]], targetIndex: IDX.ENVASADO, arrow: true },
  { id: "envasado-refrigeracion", points: [[X.envasado + W, ROW2_CY], [X.refrigeracion, ROW2_CY]], targetIndex: IDX.REFRIGERACION, arrow: true },
  { id: "refrigeracion-almacenamiento", points: [[X.refrigeracion + W, ROW2_CY], [X.almacenamiento, ROW2_CY]], targetIndex: IDX.ALMACENAMIENTO, arrow: true },
  {
    id: "almacenamiento-salida",
    points: [
      [X.almacenamiento + W, ROW2_CY],
      [1000, ROW2_CY],
      [1000, 140],
      [1052, 140],
    ],
    targetIndex: IDX.ALMACENAMIENTO,
    arrow: true,
  },
]

function pathFor(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
}

export function ProductionLineDiagram({ batch }: { batch: ProductionBatch }) {
  const arrowId = useId().replace(/:/g, "")
  const byKey = new Map(batch.stages.map((s) => [s.key, s]))
  const reached = progressIndex(batch.stages)
  const almacenDone = byKey.get("ALMACENAMIENTO")?.state === "COMPLETADA"
  const routeColor = batch.route === "YOGUR" ? "var(--func-info)" : "var(--brand-leaf)"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            {batch.status !== "LIBERADO" && batch.status !== "RECHAZADO" && batch.status !== "PLANIFICADO" ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-75" />
            ) : null}
            <span
              className={cn(
                "relative inline-flex size-2 rounded-full",
                batch.status === "RECHAZADO"
                  ? "bg-danger"
                  : batch.status === "LIBERADO"
                    ? "bg-success"
                    : batch.status === "PLANIFICADO"
                      ? "bg-muted-foreground/40"
                      : "bg-info"
              )}
            />
          </span>
          <p className="font-heading text-sm font-semibold tracking-wide text-navy uppercase dark:text-cream">
            {batch.line} · {batch.code}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
            style={{
              backgroundColor: batch.route === "YOGUR" ? "color-mix(in oklch, var(--func-info) 12%, transparent)" : "color-mix(in oklch, var(--brand-leaf) 14%, transparent)",
              color: routeColor,
            }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: routeColor }} />
            Ruta {batch.route === "YOGUR" ? "yogur" : "kumis"} activa
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-[image:radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:18px_18px] bg-taupe/10 p-4 dark:bg-secondary/10">
        <div className="relative" style={{ width: VIEW_W, height: VIEW_H }}>
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={VIEW_W} height={VIEW_H} className="absolute inset-0">
            <defs>
              <marker id={`arrow-${arrowId}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--muted-foreground)" />
              </marker>
              <marker id={`arrow-active-${arrowId}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L8,4 L0,8 Z" fill={routeColor} />
              </marker>
            </defs>
            {SEGMENTS.map((seg) => {
              const dimmed = seg.onlyRoute && seg.onlyRoute !== batch.route
              const active =
                !dimmed &&
                (seg.id === "almacenamiento-salida" ? almacenDone : reached >= seg.targetIndex)
              return (
                <path
                  key={seg.id}
                  d={pathFor(seg.points)}
                  fill="none"
                  stroke={dimmed ? "var(--border)" : active ? routeColor : "var(--border)"}
                  strokeWidth={active ? 2.5 : 2}
                  strokeDasharray={dimmed ? "3 4" : undefined}
                  strokeLinejoin="round"
                  className={active ? "flow-line" : undefined}
                  opacity={dimmed ? 0.5 : 1}
                  markerEnd={
                    seg.arrow
                      ? `url(#${active ? `arrow-active-${arrowId}` : `arrow-${arrowId}`})`
                      : undefined
                  }
                />
              )
            })}
          </svg>

          <ZonePanel title="Entradas" tone="info" x={0} y={10} w={168} h={400} items={ENTRADAS.map((e) => ({ label: e.label, icon: e.icon }))} />
          <ZonePanel
            title="Salida"
            tone="success"
            x={1052}
            y={10}
            w={168}
            h={400}
            items={SALIDA.map((s) => ({ label: s.label, image: s.image }))}
          />

          {NODES.map((node, i) => {
            const stage = byKey.get(node.key)
            if (!stage) return null
            const dimmed = node.route && node.route !== batch.route
            return (
              <FlowNode
                key={`${node.key}-${node.route ?? "x"}`}
                node={node}
                stage={stage}
                route={batch.route}
                dimmed={!!dimmed}
                delay={i * 45}
                accent={routeColor}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Variables para automatización:</span>
        {VARIABLES.map((v) => (
          <span key={v.label} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
            <v.icon className="size-3.5 text-copper" strokeWidth={1.75} />
            {v.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ZonePanel({
  title,
  tone,
  x,
  y,
  w,
  h,
  items,
}: {
  title: string
  tone: "info" | "success"
  x: number
  y: number
  w: number
  h: number
  items: { label: string; icon?: LucideIcon; image?: string }[]
}) {
  const color = tone === "info" ? "var(--func-info)" : "var(--func-success)"
  return (
    <div
      className="absolute flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border"
      style={{ left: x, top: y, width: w, height: h }}
    >
      <div className="px-3 py-2 text-center text-xs font-bold tracking-wide text-white uppercase" style={{ backgroundColor: color }}>
        {title}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 px-3 py-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            {item.image ? (
              <Image src={item.image} alt="" width={28} height={28} className="size-7 shrink-0 rounded-md ring-1 ring-border" />
            ) : item.icon ? (
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`, color }}
              >
                <item.icon className="size-3.5" strokeWidth={1.75} />
              </span>
            ) : null}
            <span className="text-xs leading-tight font-medium text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FlowNode({
  node,
  stage,
  route,
  dimmed,
  delay,
  accent,
}: {
  node: NodeSpec
  stage: ProcessStage
  route: BatchRoute
  dimmed: boolean
  delay: number
  accent: string
}) {
  const meta = STAGE_META[node.key]
  const isCurrent = stage.state === "ACTUAL" && !dimmed
  const isDone = stage.state === "COMPLETADA" && !dimmed

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flow-node-in group absolute flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 text-center transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:-translate-y-0.5 focus-visible:outline-none",
              dimmed && "border-dashed border-border bg-transparent opacity-50",
              isDone && "border-transparent text-white shadow-sm",
              isCurrent && "border-transparent text-white shadow-md",
              !dimmed && !isDone && !isCurrent && "border-border bg-card text-foreground"
            )}
          />
        }
        style={{
          left: node.x,
          top: node.y,
          width: node.w,
          height: node.h,
          animationDelay: `${delay}ms`,
          backgroundColor: isDone ? "var(--func-success)" : isCurrent ? accent : undefined,
        }}
      >
        {node.route ? (
          <span
            className="text-[9px] font-bold tracking-wider uppercase opacity-80"
            style={{ color: dimmed ? "var(--muted-foreground)" : isCurrent || isDone ? undefined : node.route === "YOGUR" ? "var(--func-info)" : "var(--brand-leaf)" }}
          >
            {node.route === "YOGUR" ? "Ruta yogur" : "Ruta kumis"}
          </span>
        ) : null}
        <span className="text-[11px] leading-tight font-semibold">{meta.title[0]}</span>
        {meta.title[1] ? <span className="text-[11px] leading-tight opacity-90">{meta.title[1]}</span> : null}
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-64">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {meta.title[0]} {meta.title[1] ?? ""}
            {node.route ? ` · ${node.route === "YOGUR" ? "Yogur" : "Kumis"}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">{meta.detail(route)}</p>
          {!dimmed ? (
            <p className="pt-1 text-xs font-medium" style={{ color: isCurrent ? accent : isDone ? "var(--func-success)" : "var(--muted-foreground)" }}>
              {isDone ? "Completada" : isCurrent ? "En curso ahora" : stage.state === "NO_APLICA" ? "No aplica a esta ruta" : "Pendiente"}
            </p>
          ) : (
            <p className="pt-1 text-xs font-medium text-muted-foreground">Ruta no usada por este lote</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
