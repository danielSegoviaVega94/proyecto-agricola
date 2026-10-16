# CONTEXT.md — Punto de Venta Agricultura

> Lenguaje compartido del dominio. Todos los agentes deben usar estos términos.
> Generado por El Arquitecto — Fase 1-3 del Grill-Me.

---

## Nombre del Proyecto

**Punto de Venta Agricultura** (nombre de trabajo, pendiente nombre comercial)

## Descripción en una línea

Marketplace web mobile-first que conecta agricultores pequeños y medianos directamente con compradores, eliminando intermediarios.

---

## Glosario del Dominio

| Término | Definición |
|---------|-----------|
| **Vendedor** | Agricultor pequeño o mediano que publica sus productos. Generalmente persona mayor. |
| **Comprador** | Consumidor final, restaurante, feria o local que busca productos agrícolas. |
| **Intermediario** | Cadena de 3-4 actores que hoy encarecen el producto desde el campo al consumidor. Este sistema existe para **eliminarlos**. |
| **Publicación** | Un producto puesto a la venta por un vendedor, con foto, descripción y tramos de precio. |
| **Tramo de precio** | Descuento escalonado por volumen. Ej: 0-9kg = $2.000/kg, 10-29kg = $1.500/kg, 30+kg = $1.300/kg. |
| **Conversación** | Chat 1 a 1 vinculado a un producto específico entre comprador y vendedor. Sirve como registro informal del acuerdo. |
| **Valoración** | Calificación bidireccional (1-5 estrellas) que comprador y vendedor se dan mutuamente después de un trato. |
| **Reporte** | Denuncia formal de un usuario contra otro. Revisada por los administradores. |
| **Panel Admin** | Interfaz privada para los 2 administradores (fundadores) para revisar reportes y gestionar usuarios. |
| **Categoría** | Clasificación predefinida de productos en árbol jerárquico (ej: Verduras > Tomate). |

---

## Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| **Vendedor (Agricultor)** | Persona mayor, usa celular, necesita UX ultra simple. Publica productos con foto y precio. |
| **Comprador** | Consumidor, restaurante, feria o local. Busca productos, contacta vendedores por chat. |
| **Administrador** | Los 2 fundadores. Revisan reportes, suspenden cuentas. No hay equipo de moderación. |

---

## Reglas de Negocio

1. La plataforma **no procesa pagos** — solo conecta las partes (modelo Facebook Marketplace).
2. La plataforma **no gestiona logística** — comprador y vendedor acuerdan retiro/entrega por chat.
3. La plataforma **no se hace responsable** de las transacciones, pero conserva los chats como registro.
4. El MVP es **100% gratuito** — modelo de monetización se define con datos reales.
5. Los precios son puestos por el vendedor con **tramos de descuento por volumen**.
6. Tanto compradores como vendedores pueden **valorar y reportar** al otro.

---

## Restricciones

- **Geografía MVP:** La Serena / Coquimbo (Región de Coquimbo, Chile).
- **Usuarios target:** Personas mayores con smartphone — la UX debe ser **extremadamente simple**.
- **Idioma:** Español (Chile).
- **Sin notificaciones push** en el MVP.
- **Sin pagos integrados** en el MVP.
- **Sin logística integrada** en el MVP.

---

## Estado Implementado al 2026-05-05

Este archivo describe el dominio. Ademas, desde esta fecha, el proyecto ya tiene implementado hasta el **Paso 12** del blueprint.

### Comportamientos ya resueltos

1. **Auth:** existe `/login` con tabs Google / telefono y fallback email para testing.
2. **Onboarding:** los usuarios sin perfil pasan por `/onboarding` y luego tienen `/perfil/[id]`.
3. **Productos:** existe flujo de publicacion, catalogo y detalle.
4. **Conversaciones:** el chat real existe para conversaciones reales; productos demo abren una conversacion demo local para previsualizar el flujo UX.
5. **Valoraciones:** tras cerrar un trato, cada parte puede valorar una sola vez.
6. **Reportes:** una parte puede reportar a la otra desde el chat; el reporte queda en `reports` con `status='pending'`.
7. **Moderacion:** existe panel `/admin/*` con reportes y usuarios; admins pueden suspender y reactivar cuentas.
8. **Suspension:** un usuario suspendido no puede crear nuevas publicaciones y ve un banner explicativo.
9. **PWA:** ya existe `manifest.webmanifest`, iconos instalables y generacion de service worker en build.

### Decisiones UX ya tomadas

- El acceso global a `Chat` fue removido del menu principal.
- El chat se abre desde el contexto del producto o desde conversaciones existentes.
- La plataforma usa copy en espanol de Chile y layout mobile-first.
- Landing, catalogo y detalle ya usan imagenes visibles y no placeholders rotos.

### Notas tecnicas vigentes

- `middleware.ts` sigue operativo pero Next 16 ya sugiere migrarlo a `proxy`.
- `pnpm build` usa `next build --webpack` por compatibilidad con la configuracion PWA.
- Los artefactos de service worker se generan en build y no se consideran fuente manual.
