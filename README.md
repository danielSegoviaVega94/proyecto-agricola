# Punto de Venta Agricultura

Marketplace web mobile-first para conectar agricultores pequenos y medianos con compradores locales, eliminando intermediarios.

## Estado actual

- Build Order completado hasta el **Paso 12 (PWA)**.
- Rama activa al momento de este documento: `feat/step-12-pwa`.
- Estado detallado: [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)
- Radiografia completa y handoff: [docs/PROJECT_RADIOGRAPHY.md](docs/PROJECT_RADIOGRAPHY.md)
- Blueprint de producto y ejecucion: [docs/blueprint.md](docs/blueprint.md)
- Contexto de dominio: [CONTEXT.md](CONTEXT.md)

## Stack

- Next.js 16 App Router
- TypeScript
- Supabase Auth + Postgres + Realtime + Storage
- Vercel
- Vitest
- Playwright
- PWA con `@ducanh2912/next-pwa`

## Comandos principales

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm test:e2e
```

## Notas operativas

- `pnpm build` usa `next build --webpack` para compatibilidad con la integracion PWA bajo Next 16.
- El proyecto genera `public/sw.js` y archivos Workbox en build. Son artefactos generados, no fuente.
- `middleware.ts` sigue funcionando, pero Next 16 ya marca deprecacion hacia `proxy`.
- El chat de productos demo abre una conversacion demo local para previsualizar el flujo cuando no existe un producto real en la base de datos.

## Funcionalidad implementada

- Auth por Google / telefono / email fallback para testing.
- Onboarding y perfil publico.
- Publicacion de productos con categorias, tramos e imagenes.
- Catalogo y detalle con filtros y busqueda.
- Conversaciones, cierre de trato, valoraciones y reportes.
- Panel admin para moderacion y suspension/reactivacion.
- Manifest PWA e iconos instalables.

## Siguiente hito

El siguiente paso del blueprint es **Paso 13: Deploy a Vercel**.
