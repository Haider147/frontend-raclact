import type { Address, User } from "@/types"
import { createRng, daysAgo, randInt } from "@/mocks/rng"

const rng = createRng(1001)

const CITIES = [
  { city: "Cali", state: "Valle del Cauca" },
  { city: "Palmira", state: "Valle del Cauca" },
  { city: "Jamundí", state: "Valle del Cauca" },
  { city: "Yumbo", state: "Valle del Cauca" },
  { city: "Buga", state: "Valle del Cauca" },
]

const CUSTOMER_NAMES = [
  "Laura Gómez", "Andrés Zapata", "María José Pérez", "Juan Camilo Rojas",
  "Valentina Hoyos", "Santiago Bermúdez", "Daniela Ortiz", "Carlos Mario Vélez",
  "Mariana Cárdenas", "Felipe Salazar", "Natalia Restrepo", "Julián Escobar",
  "Camila Aguirre", "Sebastián Londoño", "Isabella Castaño", "Mateo Herrera",
  "Sara Valencia", "Nicolás Buitrago", "Paula Andrea Ramírez", "David Quintero",
  "Luisa Fernanda Mejía", "Alejandro Ríos", "Gabriela Muñoz", "Esteban Correa",
  "Manuela Tabares", "Tomás Arboleda", "Antonia Sánchez",
]

const ADMIN_NAMES = ["Ana Restrepo", "Jorge Iván Gómez"]

function slugEmail(name: string): string {
  const clean = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s]/g, "")
  const parts = clean.split(" ")
  return `${parts[0]}.${parts[parts.length - 1]}`
}

function phone(rng: () => number): string {
  return `3${randInt(rng, 0, 2)}${randInt(rng, 0, 9)} ${randInt(rng, 100, 999)} ${randInt(rng, 1000, 9999)}`
}

export const customers: User[] = [
  ...ADMIN_NAMES.map((name, i) => {
    const id = `usr_admin_${i + 1}`
    return {
      id,
      name,
      email: `${slugEmail(name)}@raclact.co`,
      phone: phone(rng),
      role: "ADMIN" as const,
      emailVerifiedAt: daysAgo(rng, 400 + i * 30).toISOString(),
      lockedAt: null,
      deactivatedAt: null,
      avatarUrl: null,
      createdAt: daysAgo(rng, 400 + i * 30).toISOString(),
    }
  }),
  ...CUSTOMER_NAMES.map((name, i) => {
    const id = `usr_${i + 1}`
    const createdDaysAgo = randInt(rng, 5, 340)
    const verified = rng() > 0.08
    const locked = rng() > 0.94
    const deactivated = !locked && rng() > 0.95
    return {
      id,
      name,
      email: `${slugEmail(name)}@gmail.com`,
      phone: rng() > 0.15 ? phone(rng) : null,
      role: "CUSTOMER" as const,
      emailVerifiedAt: verified ? daysAgo(rng, createdDaysAgo - 1).toISOString() : null,
      lockedAt: locked ? daysAgo(rng, randInt(rng, 1, 10)).toISOString() : null,
      deactivatedAt: deactivated
        ? daysAgo(rng, randInt(rng, 1, 30)).toISOString()
        : null,
      avatarUrl: null,
      createdAt: daysAgo(rng, createdDaysAgo).toISOString(),
    }
  }),
]

export const addresses: Address[] = customers
  .filter((c) => c.role === "CUSTOMER")
  .map((customer, i) => {
    const loc = CITIES[i % CITIES.length]
    return {
      id: `addr_${i + 1}`,
      userId: customer.id,
      label: rng() > 0.5 ? "Casa" : "Trabajo",
      line1: `${["Calle", "Carrera", "Avenida"][randInt(rng, 0, 2)]} ${randInt(rng, 1, 130)} # ${randInt(rng, 1, 99)}-${randInt(rng, 1, 99)}`,
      line2: rng() > 0.6 ? `Apto ${randInt(rng, 101, 1204)}` : null,
      number: null,
      city: loc.city,
      state: loc.state,
      country: "Colombia",
      postalCode: `76${randInt(rng, 100, 999)}`,
      isDefault: true,
    } satisfies Address
  })

export function getCustomerById(id: string): User | undefined {
  return customers.find((c) => c.id === id)
}
