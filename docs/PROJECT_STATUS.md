# PROJECT_STATUS.md — Punto de Venta Agricultura

Fecha de actualización: 2026-05-05  
Estado general: avance hasta **Paso 7** del Build Order del blueprint.

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
| 7 Catálogo + Detalle | ✅ | `feat/step-7-catalog-detail` / `HEAD de la rama` | `/productos`, `/producto/[id]`, `ProductCard`, filtros + búsqueda |

## 2) Ramas activas relevantes

- `master`: base inicial.
- `feat/step-2-init-schema`
- `feat/step-3-auth`
- `feat/step-4-onboarding-profile`
- `feat/step-5-categories`
- `feat/step-6-products`
- `feat/step-7-catalog-detail` (rama actual)

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

## 4) Cobertura de tests actual

- Unit/integration (Vitest):
  - Supabase server client wrapper
  - Smoke categorías
  - Landing render
  - Auth/onboarding/products actions
  - Schema validation de tramos de precio
  - Policy assertions en SQL de migración
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

## 7) Definición de “dónde continuar”

Continuar en **Paso 8 — Conversaciones** del blueprint:

1. Server Action `openConversation(productId)` con validación anti auto-conversación.
2. `/chat` (bandeja) ordenada por `last_message_at`.
3. `/chat/[id]` con `ChatThread` + suscripción Realtime a `messages`.
4. Trigger SQL para actualizar `conversations.last_message_at` en inserciones de `messages`.
5. Tests:
   - unit para auto-conversación
   - integración envío/recepción tiempo real
   - RLS: tercero no accede a conversación ajena

## 8) Reglas de continuidad para otras IA

- Mantener TDD estricto: RED → GREEN → REFACTOR.
- No avanzar de paso con `pnpm test`, `pnpm lint`, `pnpm typecheck` en rojo.
- Mantener naming en inglés (código) y copy UI en español de Chile.
- No introducir ORM ni features fuera de alcance del blueprint.
