import type { MediaFile } from "@/types"
import { customers } from "@/mocks/customers"
import { createRng, daysAgo, pick, randInt } from "@/mocks/rng"

const rng = createRng(6677)
const admins = customers.filter((c) => c.role === "ADMIN")

const PRODUCT_IMAGES = [
  { name: "kumis-tradicional-1l.svg", url: "/products/kumis.svg" },
  { name: "yogur-fresa-250.svg", url: "/products/yogur-fresa.svg" },
  { name: "yogur-melocoton-1l.svg", url: "/products/yogur-melocoton.svg" },
  { name: "yogur-mora-250.svg", url: "/products/yogur-mora.svg" },
  { name: "kumis-tradicional-250.svg", url: "/products/kumis.svg" },
  { name: "yogur-fresa-1l.svg", url: "/products/yogur-fresa.svg" },
]

const CATEGORY_IMAGES = [
  { name: "categoria-kumis.svg", url: "/products/kumis.svg" },
  { name: "categoria-yogur.svg", url: "/products/yogur-fresa.svg" },
]

const AVATAR_IMAGES = [
  { name: "avatar-ana-restrepo.svg", url: "/products/yogur-mora.svg" },
  { name: "avatar-jorge-gomez.svg", url: "/products/kumis.svg" },
]

function buildFile(
  index: number,
  purpose: MediaFile["purpose"],
  visibility: MediaFile["visibility"],
  source: { name: string; url: string },
  deleted: boolean
): MediaFile {
  const uploader = pick(rng, admins)
  return {
    id: `file_${index}`,
    key: `raclact/${purpose.toLowerCase()}/${source.name}`,
    bucket: "raclact-media",
    purpose,
    visibility,
    mimeType: "image/svg+xml",
    sizeBytes: randInt(rng, 8_000, 42_000),
    width: 200,
    height: 200,
    originalName: source.name,
    publicUrl: source.url,
    uploadedById: uploader?.id ?? null,
    softDeletedAt: deleted ? daysAgo(rng, randInt(rng, 1, 15)).toISOString() : null,
    createdAt: daysAgo(rng, randInt(rng, 5, 200)).toISOString(),
  }
}

export const files: MediaFile[] = [
  ...PRODUCT_IMAGES.map((src, i) => buildFile(i + 1, "PRODUCT_IMAGE", "PUBLIC", src, false)),
  ...CATEGORY_IMAGES.map((src, i) => buildFile(i + 1 + 100, "CATEGORY_IMAGE", "PUBLIC", src, false)),
  ...AVATAR_IMAGES.map((src, i) => buildFile(i + 1 + 200, "USER_AVATAR", "PRIVATE", src, false)),
  buildFile(301, "PRODUCT_IMAGE", "PUBLIC", { name: "prueba-empaque-descartada.svg", url: "/products/yogur-melocoton.svg" }, true),
  buildFile(302, "PRODUCT_IMAGE", "PUBLIC", { name: "banner-antiguo.svg", url: "/products/kumis.svg" }, true),
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
