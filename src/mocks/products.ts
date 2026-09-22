import type { Category, Product, ProductVariant } from "@/types"

export const categories: Category[] = [
  { id: "cat_kumis", name: "Kumis", slug: "kumis", parentId: null, position: 1 },
  { id: "cat_yogur", name: "Yogur", slug: "yogur", parentId: null, position: 2 },
  { id: "cat_yogur_fresa", name: "Fresa", slug: "yogur-fresa", parentId: "cat_yogur", position: 1 },
  { id: "cat_yogur_melocoton", name: "Melocotón", slug: "yogur-melocoton", parentId: "cat_yogur", position: 2 },
  { id: "cat_yogur_mora", name: "Mora", slug: "yogur-mora", parentId: "cat_yogur", position: 3 },
]

/** Stock inicial por variante — el kardex en mocks/inventory.ts genera el historial
 * de movimientos que llega exactamente a este saldo. */
export const variantStock: Record<string, number> = {
  var_kum_trad_1l: 612,
  var_kum_trad_250: 1840,
  var_yog_fresa_1l: 348,
  var_yog_fresa_250: 926,
  var_yog_melocoton_1l: 41,
  var_yog_melocoton_250: 764,
  var_yog_mora_1l: 205,
  var_yog_mora_250: 38,
}

const kumisVariants: ProductVariant[] = [
  {
    id: "var_kum_trad_1l",
    productId: "prod_kumis",
    sku: "KUM-TRAD-1L",
    size: "1 L",
    color: null,
    stock: variantStock.var_kum_trad_1l,
    price: "8900",
    weightGrams: 1030,
    lengthCm: 8,
    widthCm: 8,
    heightCm: 21,
  },
  {
    id: "var_kum_trad_250",
    productId: "prod_kumis",
    sku: "KUM-TRAD-250",
    size: "250 ml",
    color: null,
    stock: variantStock.var_kum_trad_250,
    price: "2800",
    weightGrams: 270,
    lengthCm: 6,
    widthCm: 6,
    heightCm: 11,
  },
]

const flavors = [
  { key: "fresa", label: "Fresa", categoryId: "cat_yogur_fresa" },
  { key: "melocoton", label: "Melocotón", categoryId: "cat_yogur_melocoton" },
  { key: "mora", label: "Mora", categoryId: "cat_yogur_mora" },
] as const

const yogurVariants: ProductVariant[] = flavors.flatMap((flavor) => [
  {
    id: `var_yog_${flavor.key}_1l`,
    productId: "prod_yogur",
    sku: `YOG-${flavor.key.toUpperCase()}-1L`,
    size: "1 L",
    color: flavor.label,
    stock: variantStock[`var_yog_${flavor.key}_1l`],
    price: "9900",
    weightGrams: 1040,
    lengthCm: 8,
    widthCm: 8,
    heightCm: 21,
  },
  {
    id: `var_yog_${flavor.key}_250`,
    productId: "prod_yogur",
    sku: `YOG-${flavor.key.toUpperCase()}-250`,
    size: "250 ml",
    color: flavor.label,
    stock: variantStock[`var_yog_${flavor.key}_250`],
    price: "3200",
    weightGrams: 275,
    lengthCm: 6,
    widthCm: 6,
    heightCm: 11,
  },
])

export const products: Product[] = [
  {
    id: "prod_kumis",
    name: "Kumis Tradicional",
    slug: "kumis-tradicional",
    description:
      "Kumis fermentado de forma tradicional a partir de leche cruda de fincas del Valle del Cauca, sin conservantes ni colorantes artificiales.",
    price: "2800",
    currency: "COP",
    isActive: true,
    categoryId: "cat_kumis",
    images: [
      {
        id: "img_kumis_1",
        productId: "prod_kumis",
        fileId: "file_kumis_1",
        url: "/products/kumis.svg",
        alt: "Kumis Tradicional RacLact",
        position: 1,
      },
    ],
    variants: kumisVariants,
    createdAt: "2025-02-10T09:00:00.000Z",
    updatedAt: "2026-06-18T14:30:00.000Z",
  },
  {
    id: "prod_yogur",
    name: "Yogur de Sabores",
    slug: "yogur-de-sabores",
    description:
      "Yogur natural batido con preparados de fruta real — fresa, melocotón y mora — endulzado con moderación, en presentaciones de 1 L y 250 ml.",
    price: "3200",
    currency: "COP",
    isActive: true,
    categoryId: "cat_yogur",
    images: [
      {
        id: "img_yogur_fresa",
        productId: "prod_yogur",
        fileId: "file_yogur_fresa",
        url: "/products/yogur-fresa.svg",
        alt: "Yogur de Sabores RacLact — Fresa",
        position: 1,
      },
      {
        id: "img_yogur_melocoton",
        productId: "prod_yogur",
        fileId: "file_yogur_melocoton",
        url: "/products/yogur-melocoton.svg",
        alt: "Yogur de Sabores RacLact — Melocotón",
        position: 2,
      },
      {
        id: "img_yogur_mora",
        productId: "prod_yogur",
        fileId: "file_yogur_mora",
        url: "/products/yogur-mora.svg",
        alt: "Yogur de Sabores RacLact — Mora",
        position: 3,
      },
    ],
    variants: yogurVariants,
    createdAt: "2025-02-10T09:00:00.000Z",
    updatedAt: "2026-07-02T11:15:00.000Z",
  },
]

export const allVariants: ProductVariant[] = products.flatMap((p) => p.variants)

/** Bajo el umbral por defecto de reportes/inventario (5 unidades... aquí subido a 60
 * para que la maqueta muestre alertas reales con los volúmenes de una planta pequeña). */
export const LOW_STOCK_THRESHOLD = 60

export function getProductByVariantId(variantId: string): Product | undefined {
  return products.find((p) => p.variants.some((v) => v.id === variantId))
}

export function getVariantImageUrl(variantId: string): string | null {
  const product = getProductByVariantId(variantId)
  const variant = allVariants.find((v) => v.id === variantId)
  if (!product || !variant) return null
  if (product.id === "prod_kumis") return "/products/kumis.svg"
  const flavorKey = variant.color?.toLowerCase()
  const match = product.images.find((img) => img.alt.toLowerCase().includes(flavorKey ?? ""))
  return match?.url ?? product.images[0]?.url ?? null
}
