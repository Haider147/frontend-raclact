"use client"

import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AjustesPage() {
  function saveMock(section: string) {
    return (e: React.FormEvent) => {
      e.preventDefault()
      toast.success(`${section} actualizados`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes" description="Perfil, preferencias del panel y datos de la empresa." />

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="pt-4">
          <form onSubmit={saveMock("Datos de perfil")}>
            <Card>
              <CardContent>
                <FieldGroup>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="profile-name">Nombre</FieldLabel>
                    <Input id="profile-name" defaultValue="Ana Restrepo" />
                  </Field>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="profile-phone">Teléfono</FieldLabel>
                    <Input id="profile-phone" defaultValue="300 123 4567" />
                  </Field>
                  <FieldSeparator>Seguridad</FieldSeparator>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="profile-email">Correo</FieldLabel>
                    <Input id="profile-email" type="email" defaultValue="ana.restrepo@raclact.co" />
                  </Field>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="profile-password">Nueva contraseña</FieldLabel>
                    <Input id="profile-password" type="password" placeholder="••••••••" />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit">Guardar cambios</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="preferencias" className="pt-4">
          <form onSubmit={saveMock("Preferencias")}>
            <Card>
              <CardContent>
                <FieldGroup>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="pref-theme">Tema</FieldLabel>
                    <NativeSelect id="pref-theme" defaultValue="system" className="max-w-48">
                      <NativeSelectOption value="light">Claro</NativeSelectOption>
                      <NativeSelectOption value="dark">Oscuro</NativeSelectOption>
                      <NativeSelectOption value="system">Sistema</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="pref-lang">Idioma</FieldLabel>
                    <NativeSelect id="pref-lang" defaultValue="es-CO" className="max-w-48">
                      <NativeSelectOption value="es-CO">Español (Colombia)</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="pref-currency">Moneda</FieldLabel>
                    <NativeSelect id="pref-currency" defaultValue="COP" className="max-w-48" disabled>
                      <NativeSelectOption value="COP">Peso colombiano (COP)</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit">Guardar cambios</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="empresa" className="pt-4">
          <form onSubmit={saveMock("Datos de la empresa")}>
            <Card>
              <CardContent>
                <FieldGroup>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="biz-name">Razón social</FieldLabel>
                    <Input id="biz-name" defaultValue="RacLact S.A.S." />
                  </Field>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="biz-nit">NIT</FieldLabel>
                    <Input id="biz-nit" defaultValue="900.123.456-7" />
                  </Field>
                  <Field orientation="responsive">
                    <FieldLabel htmlFor="biz-address">Dirección de la planta</FieldLabel>
                    <Input id="biz-address" defaultValue="Km 3 vía Yumbo, Valle del Cauca" />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit">Guardar cambios</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
