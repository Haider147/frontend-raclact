import type { ReactNode } from "react"
import { BrandBlob } from "@/components/shared/brand-blob"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden bg-navy lg:flex lg:items-center lg:justify-center">
        <BrandBlob
          variant="a"
          className="pointer-events-none absolute -top-36 -right-28 size-[440px] text-cream/[0.06]"
        />
        <BrandBlob
          variant="c"
          strokeOnly
          className="pointer-events-none absolute -bottom-44 -left-28 size-[400px] text-copper/25"
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-white text-lg font-bold text-navy">
            RL
          </span>
          <div className="space-y-2">
            <p className="font-heading text-2xl font-semibold tracking-wide text-cream uppercase">
              RacLact
            </p>
            <p className="max-w-xs text-sm text-cream/70">Yogur que te hace bien</p>
          </div>
        </div>
      </div>
    </div>
  )
}
