/**
 * PRNG determinista (mulberry32). Los mocks lo usan en vez de Math.random()
 * para que el listado generado sea idéntico en cada render — servidor y
 * cliente producen exactamente los mismos datos y no hay mismatch de hidratación.
 */
export function createRng(seed: number): () => number {
  let s = seed >>> 0
  return function rng() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function weighted<T>(rng: () => number, entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

/** Fecha a `days` días de hoy, con hora:minuto derivados del rng (determinista). */
export function daysAgo(rng: () => number, days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(randInt(rng, 7, 19), randInt(rng, 0, 59), 0, 0)
  return date
}
