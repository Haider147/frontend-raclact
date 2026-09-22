# RacLact — Panel administrativo (maqueta)

Panel administrativo de RacLact: pedidos, catálogo, inventario, producción, compras,
facturación, clientes, descuentos, reseñas, envíos, archivos, reportes y ajustes.

**Esta es una maqueta visual sin backend.** Todos los datos salen de `src/mocks/` y las
mutaciones (crear, editar, borrar, cambiar estado) operan sobre estado local en memoria:
se pierden al recargar la página, y eso es intencional. El objetivo es tener la solución
visual cerrada y aprobada antes de conectar el API real de `raclact-backend`.

## Cómo correr el proyecto

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). Cualquier correo/contraseña entra
al panel en `/login` — no hay autenticación real.

Otros comandos:

```bash
pnpm build   # build de producción
pnpm start   # sirve el build de producción
pnpm lint    # ESLint (usa el flat config de eslint-config-next)
```

## Stack

Next.js 16 (App Router) · TypeScript estricto · Tailwind CSS v4 · shadcn/ui sobre
`@base-ui-components/react` · TanStack Table v9 · Recharts · `date-fns` (locale `es`) ·
`next-themes` para modo oscuro.

## Estructura

```
src/
├── app/
│   ├── (auth)/login/                 # login, recuperar contraseña, verificación OTP
│   └── (panel)/                      # shell del panel (sidebar + topbar) y todas las pages
├── components/
│   ├── ui/                           # primitivas shadcn
│   ├── layout/                       # sidebar, topbar, breadcrumbs, auth shell
│   ├── shared/                       # DataTable, PageHeader, StatCard, StatusBadge, Money…
│   └── <dominio>/                    # componentes específicos (pedidos, productos, inventario…)
├── lib/                              # format.ts, status.ts, utils.ts
├── types/                            # tipos calcados del contrato de raclact-backend
└── mocks/                            # datos hardcodeados por dominio, deterministas (PRNG con seed)
```

## Mapa de rutas

| Ruta | Descripción |
| --- | --- |
| `/login`, `/login/recuperar`, `/login/otp` | Autenticación (sin lógica real) |
| `/` | Dashboard |
| `/pedidos`, `/pedidos/[id]` | Pedidos y su detalle (timeline, despacho, entrega, cancelación) |
| `/productos`, `/productos/nuevo`, `/productos/[id]` | Catálogo de productos |
| `/productos/categorias` | Árbol de categorías |
| `/inventario`, `/inventario/[variantId]` | Existencias, kardex y ajuste de stock |
| `/produccion`, `/produccion/lotes/[id]`, `/produccion/planificacion`, `/produccion/calidad` | Producción — *módulo futuro* |
| `/compras`, `/compras/proveedores`, `/compras/ordenes`, `/compras/ordenes/[id]`, `/compras/insumos` | Compras y proveedores — *módulo futuro* |
| `/facturacion`, `/facturacion/[id]`, `/facturacion/notas-credito` | Facturación — *módulo futuro* |
| `/clientes`, `/clientes/[id]` | Clientes |
| `/descuentos` | Cupones de descuento |
| `/resenas` | Moderación de reseñas |
| `/envios` | Métodos de envío |
| `/archivos` | Mediateca |
| `/reportes` | Reportes de pedidos e inventario (con exportación CSV real) |
| `/ajustes` | Perfil, preferencias y datos de la empresa |

Los módulos marcados como "módulo futuro" no existen todavía en `raclact-backend`
(ver los comentarios en `src/types/production.ts`, `purchasing.ts` e `invoicing.ts`):
conectarlos exigirá ampliar `schema.prisma` y el `enum Role` del backend. Conservan el
badge "Próximamente" en la sidebar aunque su interfaz ya esté completa.

## Qué tocar para conectar el backend real

1. **Reemplazar el origen de datos, no las pantallas.** Cada page importa sus datos
   directamente de `src/mocks/*`. Los tipos en `src/types/` ya están calcados del
   contrato de `raclact-backend` (`Paginated<T>`, `ApiErrorShape`, enums, modelos), así
   que el cambio es sustituir `import { orders } from "@/mocks/orders"` por una llamada
   real (`fetch`, un cliente generado desde el OpenAPI de `/docs.json`, o TanStack Query)
   que devuelva el mismo shape.
2. **Mutaciones.** Los diálogos y formularios ya llaman a un `onSave`/`onUpdate` con el
   objeto final — solo hay que cambiar ese callback por la llamada `POST`/`PATCH` real y
   revalidar en vez de actualizar el `useState` local.
3. **Autenticación.** `/login` hoy redirige sin validar nada. Falta JWT, refresh,
   middleware de sesión y las pantallas de OTP/recuperación conectadas a
   `POST /auth/*`.
4. **Paginación y filtros server-side.** El `DataTable` compartido pagina en cliente
   sobre el arreglo completo; al conectar, mover `page`/`limit`/`search` a query params
   reales contra los endpoints `GET .../admin?...`.
5. **Producción, Compras y Facturación** no tienen contrato de backend todavía — son
   módulos maqueta completos a la espera de que se diseñen los modelos correspondientes.
