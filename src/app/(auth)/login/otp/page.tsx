"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { AuthShell } from "@/components/layout/auth-shell"

export default function OtpPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  function handleVerify() {
    setLoading(true)
    setTimeout(() => {
      toast.success("Verificación exitosa")
      router.push("/")
    }, 400)
  }

  return (
    <AuthShell>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Volver a iniciar sesión
      </Link>

      <div className="mb-8 space-y-1.5">
        <h1 className="heading-page">Verifica tu código</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa el código de 6 dígitos que enviamos a tu correo.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          className="w-full"
          size="lg"
          disabled={code.length < 6 || loading}
          onClick={handleVerify}
        >
          {loading ? "Verificando…" : "Verificar código"}
        </Button>

        <button
          type="button"
          className="text-xs font-medium text-copper hover:underline"
          onClick={() => toast.info("Código reenviado")}
        >
          Reenviar código
        </button>
      </div>
    </AuthShell>
  )
}
