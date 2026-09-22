"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { ImageIcon, Trash2, Upload } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { files as initialFiles } from "@/mocks/files"
import { customers } from "@/mocks/customers"
import { formatDateTime } from "@/lib/format"
import type { FilePurpose, FileVisibility, MediaFile } from "@/types"

const PURPOSE_LABELS: Record<FilePurpose, string> = {
  PRODUCT_IMAGE: "Imagen de producto",
  CATEGORY_IMAGE: "Imagen de categoría",
  USER_AVATAR: "Avatar de usuario",
}

function formatBytes(bytes: number): string {
  return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`
}

export default function ArchivosPage() {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles)
  const [purpose, setPurpose] = useState<FilePurpose | "ALL">("ALL")
  const [visibility, setVisibility] = useState<FileVisibility | "ALL">("ALL")
  const [selected, setSelected] = useState<MediaFile | null>(null)
  const [uploading, setUploading] = useState(0)

  const active = files.filter((f) => !f.softDeletedAt)
  const trashed = files.filter((f) => f.softDeletedAt)

  const filtered = useMemo(() => {
    return active.filter((f) => {
      if (purpose !== "ALL" && f.purpose !== purpose) return false
      if (visibility !== "ALL" && f.visibility !== visibility) return false
      return true
    })
  }, [active, purpose, visibility])

  function simulateUpload() {
    setUploading(1)
    const interval = setInterval(() => {
      setUploading((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 0
        }
        return p + 20
      })
    }, 150)
    setTimeout(() => {
      const uploader = customers.find((c) => c.role === "ADMIN")
      setFiles((prev) => [
        {
          id: `file_upload_${Date.now()}`,
          key: `raclact/product_image/nueva-imagen-${Date.now()}.svg`,
          bucket: "raclact-media",
          purpose: "PRODUCT_IMAGE",
          visibility: "PUBLIC",
          mimeType: "image/svg+xml",
          sizeBytes: 18_200,
          width: 200,
          height: 200,
          originalName: "nueva-imagen.svg",
          publicUrl: "/products/yogur-fresa.svg",
          uploadedById: uploader?.id ?? null,
          softDeletedAt: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      toast.success("Archivo subido (simulado)")
    }, 900)
  }

  function softDelete(file: MediaFile) {
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, softDeletedAt: new Date().toISOString() } : f)))
    setSelected(null)
    toast.success(`"${file.originalName}" movido a la papelera`)
  }

  function restore(file: MediaFile) {
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, softDeletedAt: null } : f)))
    toast.success(`"${file.originalName}" restaurado`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archivos"
        description="Mediateca de imágenes de productos, categorías y avatares."
        actions={
          <Button onClick={simulateUpload} disabled={uploading > 0}>
            <Upload className="size-3.5" strokeWidth={1.75} />
            Subir archivo
          </Button>
        }
      />

      {uploading > 0 ? (
        <div className="space-y-1.5">
          <Progress value={uploading} />
          <p className="text-xs text-muted-foreground">Subiendo… {uploading}%</p>
        </div>
      ) : null}

      <Tabs defaultValue="mediateca">
        <TabsList>
          <TabsTrigger value="mediateca">Mediateca ({active.length})</TabsTrigger>
          <TabsTrigger value="papelera">Papelera ({trashed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mediateca" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <NativeSelect value={purpose} onChange={(e) => setPurpose(e.target.value as FilePurpose | "ALL")} className="w-52">
              <NativeSelectOption value="ALL">Todos los propósitos</NativeSelectOption>
              {(Object.keys(PURPOSE_LABELS) as FilePurpose[]).map((p) => (
                <NativeSelectOption key={p} value={p}>
                  {PURPOSE_LABELS[p]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect value={visibility} onChange={(e) => setVisibility(e.target.value as FileVisibility | "ALL")} className="w-36">
              <NativeSelectOption value="ALL">Toda visibilidad</NativeSelectOption>
              <NativeSelectOption value="PUBLIC">Pública</NativeSelectOption>
              <NativeSelectOption value="PRIVATE">Privada</NativeSelectOption>
            </NativeSelect>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Sin archivos" description="Ajusta los filtros o sube un archivo." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {filtered.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelected(file)}
                  className="group space-y-1.5 rounded-xl border border-border p-2 text-left hover:border-copper/50"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-taupe/40">
                    {file.publicUrl ? (
                      <Image src={file.publicUrl} alt={file.originalName ?? ""} fill className="object-cover" />
                    ) : null}
                  </div>
                  <p className="truncate text-xs font-medium text-foreground">{file.originalName}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {file.visibility === "PUBLIC" ? "Pública" : "Privada"}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="papelera" className="space-y-4 pt-4">
          {trashed.length === 0 ? (
            <EmptyState icon={Trash2} title="Papelera vacía" />
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {trashed.map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {file.publicUrl ? (
                      <Image
                        src={file.publicUrl}
                        alt={file.originalName ?? ""}
                        width={36}
                        height={36}
                        className="size-9 rounded-lg object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        Eliminado {formatDateTime(file.softDeletedAt!)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => restore(file)}>
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.originalName}</SheetTitle>
            <SheetDescription>Detalle del archivo</SheetDescription>
          </SheetHeader>
          {selected ? (
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {selected.publicUrl ? (
                <div className="relative aspect-square overflow-hidden rounded-xl bg-taupe/40">
                  <Image src={selected.publicUrl} alt={selected.originalName ?? ""} fill className="object-contain" />
                </div>
              ) : null}
              <dl className="space-y-2 text-sm">
                <Row label="Propósito" value={PURPOSE_LABELS[selected.purpose]} />
                <Row label="Visibilidad" value={selected.visibility === "PUBLIC" ? "Pública" : "Privada"} />
                <Row label="Dimensiones" value={`${selected.width} × ${selected.height} px`} />
                <Row label="Peso" value={formatBytes(selected.sizeBytes)} />
                <Row label="Tipo MIME" value={selected.mimeType} />
                <Row
                  label="Subido por"
                  value={customers.find((c) => c.id === selected.uploadedById)?.name ?? "—"}
                />
                <Row label="Fecha" value={formatDateTime(selected.createdAt)} />
              </dl>
            </div>
          ) : null}
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
            <SheetClose render={<Button variant="outline" />}>Cerrar</SheetClose>
            {selected ? (
              <Button variant="destructive" onClick={() => softDelete(selected)}>
                <Trash2 className="size-3.5" strokeWidth={1.75} />
                Eliminar
              </Button>
            ) : null}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
