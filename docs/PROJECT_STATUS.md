# PROJECT_STATUS.md — Punto de Venta Agricultura

Fecha de actualización: 2026-05-05  
Estado general: avance hasta **Paso 12** del Build Order del blueprint.

## 1) Estado por paso (Blueprint §17)

| Paso | Estado | Rama / Commit | Nota |
|---|---|---|---|
| 0 Bootstrap | ✅ | `master` / `3a48148` | Next.js + TypeScript + base tooling |
| 1 Supabase SSR | ✅ | `master` / `3a48148` | `lib/supabase/{server,client,middleware}` |
| 2 Schema + Seed | ✅ | `feat/step-2-init-schema` / `6ee3065` | Migración `0001_init.sql` + `seed.sql` + smoke test |
| 3 Auth | ✅ | `feat/step-3-auth` / `b794831` | `/login`, callback OAuth y OTP verify |
| 4 Onboarding + Perfil | ✅ | `feat/step-4-onboarding-profile` / `6781a41` | `/onboarding`, action `completeOnboarding`, `/perfil/[id]` |
| 5 Categorías | ✅ | `feat/step-5-categories` / `920090e` | `getCategoryTree()` + `CategoryPicker` |
| 6 Publicar producto | ✅ | `feat/step-6-products` / `f40a994` | `/publicar`, Zod + RHF + tiers + action `createProduct` |
| 7 Catálogo + Detalle | ✅ | `feat/step-7-catalog-detail` / `5ecde09` | `/productos`, `/producto/[id]`, `ProductCard`, filtros + búsqueda |
| 8 Conversaciones | ✅ | `feat/step-8-conversations` / `26229ac` | `openConversation`, `/chat`, `/chat/[id]`, realtime + trigger SQL |
| 9 Cierre + Valoración | ✅ | `feat/step-9-ratings` / `6449ba5` | cerrar trato, `RatingForm`, `RatingStars`, perfil con resumen de valoraciones |
| 10 Reportes | ✅ | `feat/step-10-reports` / `0e49359` | `ReportButton`, `submitReport`, tests unit + RLS |
| 11 Panel Admin | ✅ | `feat/step-11-admin` / `9a454c9` | guard admin, `/admin/*`, suspensión/reactivación y bloqueo a usuarios suspendidos |
| 12 PWA | ✅ | `feat/step-12-pwa` / `HEAD de la rama` | `manifest`, iconos 192/512, `next-pwa`, `sw.js` generado en build |

## 2) Ramas activas relevantes

- `master`: base inicial.
- `feat/step-2-init-schema`
- `feat/step-3-auth`
- `feat/step-4-onboarding-profile`
- `feat/step-5-categories`
- `feat/step-6-products`
- `feat/step-7-catalog-detail`
- `feat/step-8-conversations`
- `feat/step-9-ratings`
- `feat/step-10-reports`
- `feat/step-11-admin`
- `feat/step-12-pwa` (rama actual)

## 3) Archivos clave agregados por funcionalidad

- Auth:
  - `app/login/page.tsx`
  - `app/auth/callback/route.ts`
  - `app/auth/confirm/route.ts`
  - `tests/e2e/auth-login.spec.ts`
- Onboarding y perfil:
  - `app/onboarding/actions.ts`
  - `app/onboarding/onboarding-form.tsx`
  - `app/onboarding/page.tsx`
  - `app/perfil/[id]/page.tsx`
- Categorías:
  - `lib/categories/get-category-tree.ts`
  - `components/category-picker.tsx`
- Publicación:
  - `app/publicar/actions.ts`
  - `app/publicar/publish-product-form.tsx`
  - `app/publicar/page.tsx`
  - `lib/products/product-schema.ts`
  - `components/products/price-tier-editor.tsx`
  - `components/products/product-image-uploader.tsx`
- Catálogo y detalle:
  - `app/productos/page.tsx`
  - `app/producto/[id]/page.tsx`
  - `components/products/product-card.tsx`
  - `lib/products/catalog.ts`
  - `lib/products/demo-data.ts`
- Conversaciones:
  - `app/chat/actions.ts`
  - `app/chat/page.tsx`
  - `app/chat/[id]/page.tsx`
  - `components/chat/chat-thread.tsx`
  - `components/chat/disclaimer-banner.tsx`
  - `lib/chat/{realtime,server-data}.ts`
  - `supabase/migrations/0002_messages_last_message_trigger.sql`
- Cierre y valoración:
  - `components/rating/rating-stars.tsx`
  - `components/rating/rating-form.tsx`
  - `tests/ratings/{rating-stars,submit-rating}.test.ts*`
  - `tests/chat/close-conversation.test.ts`
- Reportes:
  - `components/chat/report-button.tsx`
  - `tests/reports/submit-report.test.ts`
  - `tests/rls/reports-access-policy.test.ts`
- Panel admin:
  - `lib/admin/{require-admin-user,data}.ts`
  - `app/admin/{layout,page,actions}.ts*`
  - `app/admin/reportes/page.tsx`
  - `app/admin/usuarios/page.tsx`
  - `tests/admin/{require-admin-user,suspend-user}.test.ts`
- PWA:
  - `app/manifest.ts`
  - `next.config.ts`
  - `public/icon-192.png`
  - `public/icon-512.png`
  - `tests/pwa/{manifest,icons}.test.ts`

## 4) Cobertura de tests actual

- Unit/integration (Vitest):
  - Supabase server client wrapper
  - Smoke categorías
  - Landing render
  - Auth/onboarding/products actions
  - Schema validation de tramos de precio
  - Policy assertions en SQL de migración
  - Conversaciones: anti auto-chat, bridge realtime de mensajes, trigger SQL `last_message_at`
  - Cierre + valoración: cierre de trato, rating duplicado, `RatingStars`, RLS inmutable
  - Reportes: creación `pending` y RLS de lectura `reporter/admin`
  - Admin: guard server-side, suspensión de usuarios, bloqueo por `is_suspended`
  - PWA: manifest installable, iconos presentes y build con service worker generado
- E2E (Playwright):
  - Login fallback con `signInWithOtp` (email mock para CI)
  - Navegación landing → catálogo → detalle de producto

## 5) Comandos de verificación actuales

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm test:e2e
```

## 6) Estado de entorno y notas operativas

- `.env.local` existe localmente (no versionado), con URL/keys de Supabase.
- `middleware.ts` de Next 16 muestra warning deprecado (migrar a `proxy` más adelante).
- `supabase gen types` vía CLI puede requerir:
  - `supabase login` no interactivo (token), o
  - Docker según modo de generación usado por CLI.
- Ajuste UX post Paso 9:
  - El acceso global a `Chat` fue removido del menú principal.
  - Productos demo abren una conversación demo local para previsualizar el flujo.
  - El hilo agrega el mensaje enviado de forma inmediata, sin depender solo del eco Realtime.
  - Catálogo, landing y detalle usan imágenes visibles (URLs válidas o rutas resueltas de Storage).

## 7) Definición de “dónde continuar”

Continuar en **Paso 13 — Deploy a Vercel** del blueprint:

1. Conectar repo a Vercel.
2. Cargar variables de entorno.
3. Verificar smoke de producción.

## 8) Reglas de continuidad para otras IA

- Mantener TDD estricto: RED → GREEN → REFACTOR.
- No avanzar de paso con `pnpm test`, `pnpm lint`, `pnpm typecheck` en rojo.
- Mantener naming en inglés (código) y copy UI en español de Chile.
- No introducir ORM ni features fuera de alcance del blueprint.
