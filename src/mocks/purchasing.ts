// Módulo futuro — no existe en raclact-backend (ver comentario en src/types/purchasing.ts).

import type { PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatus, RawMaterial, Supplier } from "@/types"
import { createRng, daysAgo, pick, randInt } from "@/mocks/rng"

const rng = createRng(8899)

export const suppliers: Supplier[] = [
  {
    id: "sup_1",
    name: "Lácteos del Valle S.A.S.",
    nit: "900.221.334-5",
    contactName: "Wilmer Cárdenas",
    contactPhone: "318 445 2210",
    contactEmail: "ventas@lacteosdelvalle.co",
    suppliesInputs: ["Leche cruda entera"],
    leadTimeDays: 1,
    isActive: true,
  },
  {
    id: "sup_2",
    name: "Biocultivos Andinos",
    nit: "901.556.221-2",
    contactName: "Paola Jiménez",
    contactPhone: "312 900 4471",
    contactEmail: "pedidos@biocultivosandinos.com",
    suppliesInputs: ["Cultivo yogur (S. thermophilus + L. bulgaricus)", "Cultivo kumis (lácticas + levaduras)"],
    leadTimeDays: 7,
    isActive: true,
  },
  {
    id: "sup_3",
    name: "Frutales del Pacífico",
    nit: "890.113.667-9",
    contactName: "Camilo Restrepo",
    contactPhone: "300 778 2201",
    contactEmail: "compras@frutalespacifico.co",
    suppliesInputs: ["Preparado de fruta — fresa", "Preparado de fruta — melocotón", "Preparado de fruta — mora"],
    leadTimeDays: 4,
    isActive: true,
  },
  {
    id: "sup_4",
    name: "EcoEmpaques Cali",
    nit: "805.221.990-1",
    contactName: "Lorena Vidal",
    contactPhone: "315 662 8830",
    contactEmail: "lorena.vidal@ecoempaques.co",
    suppliesInputs: ["Envase 1 L", "Envase 250 ml", "Cartón multicapa reciclable", "Bioplástico PLA compostable", "Tapas"],
    leadTimeDays: 10,
    isActive: true,
  },
  {
    id: "sup_5",
    name: "Endulzantes Naturales SAS",
    nit: "830.447.112-3",
    contactName: "Héctor Salazar",
    contactPhone: "301 559 4402",
    contactEmail: "hsalazar@endulzantesnaturales.co",
    suppliesInputs: ["Endulzante"],
    leadTimeDays: 5,
    isActive: false,
  },
]

export const rawMaterials: RawMaterial[] = [
  { id: "rm_1", name: "Leche cruda entera", unit: "L", stock: 3200, reorderPoint: 2000 },
  { id: "rm_2", name: "Cultivo yogur (S. thermophilus + L. bulgaricus)", unit: "g", stock: 85, reorderPoint: 100 },
  { id: "rm_3", name: "Cultivo kumis (lácticas + levaduras)", unit: "g", stock: 60, reorderPoint: 80 },
  { id: "rm_4", name: "Preparado de fruta — fresa", unit: "kg", stock: 42, reorderPoint: 40 },
  { id: "rm_5", name: "Preparado de fruta — melocotón", unit: "kg", stock: 28, reorderPoint: 40 },
  { id: "rm_6", name: "Preparado de fruta — mora", unit: "kg", stock: 55, reorderPoint: 40 },
  { id: "rm_7", name: "Endulzante", unit: "kg", stock: 130, reorderPoint: 60 },
  { id: "rm_8", name: "Cartón multicapa reciclable", unit: "unidades", stock: 4800, reorderPoint: 2000 },
  { id: "rm_9", name: "Bioplástico PLA compostable", unit: "unidades", stock: 5200, reorderPoint: 2500 },
  { id: "rm_10", name: "Tapas", unit: "unidades", stock: 9100, reorderPoint: 4000 },
]

const STATUS_POOL: PurchaseOrderStatus[] = ["BORRADOR", "ENVIADA", "RECIBIDA_PARCIAL", "RECIBIDA", "ANULADA"]

function buildLines(orderId: string, supplierInputs: string[]): PurchaseOrderLine[] {
  return supplierInputs.slice(0, randInt(rng, 1, Math.min(3, supplierInputs.length))).map((name, i) => {
    const material = rawMaterials.find((m) => m.name === name)
    const quantityOrdered = randInt(rng, 50, 500)
    return {
      id: `${orderId}-line-${i + 1}`,
      purchaseOrderId: orderId,
      rawMaterialId: material?.id ?? `rm_unknown_${i}`,
      rawMaterialName: name,
      quantityOrdered,
      quantityReceived: 0,
      unitCost: String(randInt(rng, 800, 12000)),
    }
  })
}

export const purchaseOrders: PurchaseOrder[] = suppliers.flatMap((supplier, si) =>
  Array.from({ length: 2 }, (_, i) => {
    const id = `po_${si + 1}_${i + 1}`
    const status = pick(rng, STATUS_POOL)
    const lines = buildLines(id, supplier.suppliesInputs).map((line) => ({
      ...line,
      quantityReceived:
        status === "RECIBIDA"
          ? line.quantityOrdered
          : status === "RECIBIDA_PARCIAL"
            ? Math.round(line.quantityOrdered * (0.3 + rng() * 0.4))
            : 0,
    }))
    const total = lines.reduce((sum, l) => sum + Number(l.unitCost) * l.quantityOrdered, 0)
    const issuedAt = daysAgo(rng, randInt(rng, 2, 60))
    return {
      id,
      number: `OC-${1000 + si * 10 + i}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status,
      issuedAt: issuedAt.toISOString(),
      expectedAt: new Date(issuedAt.getTime() + supplier.leadTimeDays * 24 * 60 * 60 * 1000).toISOString(),
      total: String(total),
      lines,
    } satisfies PurchaseOrder
  })
)
