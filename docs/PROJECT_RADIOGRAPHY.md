# PROJECT_RADIOGRAPHY.md — Punto de Venta Agricultura

Fecha de actualizacion: 2026-05-05

## 1. Resumen ejecutivo

El proyecto ya implementa el MVP funcional desde bootstrap hasta **Paso 12 (PWA)** del blueprint. La aplicacion compila, construye y tiene cobertura de validacion automatizada sobre auth, onboarding, publicacion, catalogo, chat, valoraciones, reportes, panel admin y manifest PWA.

Estado tecnico actual:

- `pnpm test` en verde
- `pnpm lint` en verde
- `pnpm typecheck` en verde
- `pnpm build` en verde

Estado producto actual:

- Landing publica operativa
- Login y onboarding funcionales
- Publicacion y visualizacion de productos funcionales
- Chat operativo para productos reales y preview demo para productos fallback
- Cierre de trato, valoracion y reportes implementados
- Panel admin implementado
- PWA configurada con `manifest.webmanifest` y `sw.js` generado en build

## 2. Build Order ejecutado

| Paso | Estado | Rama | Commit |
|---|---|---|---|
| 0 Bootstrap | Completo | `master` | `3a48148` |
| 1 Supabase SSR | Completo | `master` | `3a48148` |
| 2 Schema + Seed | Completo | `feat/step-2-init-schema` | `6ee3065` |
| 3 Auth | Completo | `feat/step-3-auth` | `b794831` |
| 4 Onboarding + Perfil | Completo | `feat/step-4-onboarding-profile` | `6781a41` |
| 5 Categorias | Completo | `feat/step-5-categories` | `920090e` |
| 6 Publicar producto | Completo | `feat/step-6-products` | `f40a994` |
| 7 Catalogo + Detalle | Completo | `feat/step-7-catalog-detail` | `5ecde09` |
| 8 Conversaciones | Completo | `feat/step-8-conversations` | `26229ac` |
| 9 Cierre + Valoracion | Completo | `feat/step-9-ratings` | `3e880c0` y `6449ba5` |
| 10 Reportes | Completo | `feat/step-10-reports` | `0e49359` |
| 11 Panel Admin | Completo | `feat/step-11-admin` | `9a454c9` |
| 12 PWA | Completo | `feat/step-12-pwa` | `79c6dad` |

## 3. Arquitectura actual

### Frontend

- App Router con mezcla de Server Components y Client Components.
- Formularios con `useActionState` y server actions.
- UI mobile-first alineada con los prototipos de `.od/`.

### Backend

- Supabase SSR para sesion server/client.
- Postgres con schema y RLS definidos en `supabase/migrations/0001_init.sql`.
- Realtime para mensajes en chat.
- Storage para imagenes de producto y avatares.

### PWA

- `@ducanh2912/next-pwa`
- `app/manifest.ts`
- iconos en `public/icon-192.png` y `public/icon-512.png`
- `pnpm build` genera `public/sw.js`

## 4. Rutas implementadas

### Publicas

- `/`
- `/productos`
- `/producto/[id]`
- `/perfil/[id]`
- `/login`

### Auth / onboarding

- `/auth/callback`
- `/auth/confirm`
- `/onboarding`

### App autenticada

- `/publicar`
- `/chat`
- `/chat/[id]`
- `/perfil` (redirect a `/perfil/[user.id]`)

### Admin

- `/admin`
- `/admin/reportes`
- `/admin/usuarios`

## 5. Comportamientos especiales ya implementados

### Chat

- El acceso global a `Chat` fue removido del menu principal.
- El boton `Contactar` en detalle de producto abre el flujo correcto de conversacion.
- En mensajes reales, el mensaje se inserta y aparece de inmediato en UI sin depender solo del evento Realtime.
- Las conversaciones demo (`demo-thread-*`) y el seed `demoProducts` fueron eliminados. Catalogo y chat operan solo contra datos reales.

### Moderacion

- Usuarios `admin` pueden ver `/admin/*`.
- No-admin son redirigidos fuera del panel.
- Usuarios suspendidos no pueden publicar nuevos productos.
- La pagina `/publicar` muestra banner explicativo cuando `is_suspended = true`.

### Build / compatibilidad Next 16

- `pnpm build` usa `--webpack` porque la integracion PWA inyecta config webpack.
- Se separaron estados iniciales de acciones server-only para cumplir la restriccion de Next 16 sobre archivos `"use server"`.

## 6. Cobertura de testing

### Unit / integration con Vitest

- wrapper de cliente Supabase server
- smoke de categorias
- render de landing
- acciones de onboarding
- validacion de schema de producto
- `ProductCard`
- `RatingStars`
- accion `createProduct`
- accion `openConversation`
- bridge realtime de chat
- cierre de conversacion
- valoracion duplicada
- `submitReport`
- guard admin
- suspension de usuarios
- manifest PWA
- iconos PWA

### RLS / SQL assertions

- insert owner en products
- lectura de conversaciones / mensajes
- inmutabilidad de ratings
- acceso a reports por reportante o admin

### E2E actuales

- login fallback con email mock
- landing -> catalogo -> detalle

### Nota

El blueprint pide todavia un E2E admin completo y Lighthouse/PWA score en CI. Esas piezas no estan implementadas aun.

## 7. Archivos fuente mas importantes

### Supabase

- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`
- `middleware.ts`

### Dominio productos

- `lib/products/catalog.ts`
- `lib/products/image-url.ts`
- `lib/products/product-schema.ts`
- `app/publicar/actions.ts`

### Dominio chat

- `app/chat/actions.ts`
- `app/chat/state.ts`
- `lib/chat/realtime.ts`
- `lib/chat/server-data.ts`
- `components/chat/chat-thread.tsx`
- `components/chat/report-button.tsx`

### Dominio admin

- `lib/admin/require-admin-user.ts`
- `lib/admin/data.ts`
- `app/admin/actions.ts`
- `app/admin/reportes/page.tsx`
- `app/admin/usuarios/page.tsx`

### PWA

- `next.config.ts`
- `app/manifest.ts`
- `public/icon-192.png`
- `public/icon-512.png`

## 8. Entorno y dependencias relevantes

- `@supabase/ssr`
- `@supabase/supabase-js`
- `react-hook-form`
- `zod`
- `@ducanh2912/next-pwa`
- `vitest`
- `@playwright/test`

Variables locales ya usadas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / anon-compatible config actual del proyecto
- otras variables locales no versionadas en `.env.local`

## 9. Riesgos y observaciones abiertas

- `middleware.ts` sigue con warning deprecado en Next 16; debe migrarse a `proxy` mas adelante.
- El flujo chat demo sirve para UX local, pero no reemplaza conversaciones reales de base de datos.
- El panel admin esta validado por tests server-side, no por E2E completo.
- La PWA esta configurada y construye, pero no se corrio Lighthouse CI en este paso.
- Los artefactos `sw.js` y `workbox-*.js` se generan en build y no deben tratarse como fuente manual.

## 10. Como retomar el proyecto sin perder contexto

Orden recomendado para una nueva IA o sesion:

1. Leer `README.md`
2. Leer `docs/PROJECT_STATUS.md`
3. Leer este archivo `docs/PROJECT_RADIOGRAPHY.md`
4. Leer `docs/blueprint.md` seccion 17
5. Leer `CONTEXT.md`
6. Verificar rama actual y `git log --oneline --decorate -12`
7. Ejecutar:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## 11. Punto exacto de continuidad

No continuar automaticamente mas alla de documentacion en este mensaje.

El siguiente paso del blueprint pendiente es:

- **Paso 13 — Deploy a Vercel**

Subpasos esperados:

- conectar repo a Vercel
- cargar variables de entorno
- desplegar preview/prod
- validar smoke en URL real
