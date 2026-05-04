# DESIGN.md — Punto de Venta Agricultura

> Sistema visual del marketplace. Inspirado en Apple HIG (claridad, espacio, tipografía grande)
> con identidad agrícola propia (verde campo + acento sol).
> Generado por el Diseñador UI/UX — Open Design.
> Fecha: 2026-05-04.

---

## Filosofía Visual

1. **Claridad para Don Luis.** El usuario primario es persona mayor. Botones grandes (≥56px), texto base 18px, contraste alto, ningún elemento decorativo que distraiga.
2. **Mobile-first absoluto.** Cada layout se diseña a 360px y crece. Desktop es `enhancement`.
3. **Confianza agrícola.** Verde campo como color principal — comunica frescura, naturaleza, producto sano.
4. **Cero ruido visual.** Mucho blanco. Cero gradientes recargados. Sombras suaves.
5. **Tap targets generosos.** Mínimo 44px, recomendado 56px en acciones primarias.

---

## Tokens

### Color

```css
/* Neutros */
--bg:           #FAFAF7;   /* off-white cálido, no estéril */
--surface:      #FFFFFF;
--text:         #0F0F0F;
--text-soft:    #4A4A4A;
--text-muted:   #8A8A8A;
--border:       #E8E6E0;
--border-soft:  #F0EEE8;

/* Marca — Verde campo */
--brand:        #16803C;   /* primario */
--brand-strong: #115E2C;
--brand-soft:   #E8F5EE;
--brand-ink:    #FFFFFF;

/* Acentos */
--sun:          #F59E0B;   /* amarillo cosecha — ratings, destacados */
--sun-soft:     #FEF3C7;

/* Estados */
--ok:           #16803C;
--warn:         #B45309;
--danger:       #B91C1C;
--danger-soft:  #FEE2E2;
--info:         #1E40AF;
--info-soft:    #DBEAFE;
```

### Tipografía

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display",
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Escala mobile */
--fs-xs:   13px;
--fs-sm:   15px;
--fs-base: 18px;          /* base mayor a estándar — accesible */
--fs-lg:   22px;
--fs-xl:   28px;
--fs-2xl:  34px;
--fs-3xl:  44px;          /* hero */
```

### Espaciado

Escala 4px base.

```css
--sp-1: 4px;
--sp-2: 8px;
--sp-3: 12px;
--sp-4: 16px;
--sp-5: 20px;
--sp-6: 24px;
--sp-8: 32px;
--sp-10: 40px;
--sp-12: 48px;
--sp-16: 64px;
```

### Radio

```css
--r-sm: 8px;
--r-md: 12px;
--r-lg: 16px;
--r-xl: 20px;
--r-pill: 999px;
```

### Sombra

```css
--shadow-sm: 0 1px 2px rgba(15, 15, 15, 0.04);
--shadow-md: 0 4px 12px rgba(15, 15, 15, 0.06);
--shadow-lg: 0 12px 32px rgba(15, 15, 15, 0.08);
```

### Tap targets

| Elemento | Altura mínima |
|----------|---------------|
| Botón primario | 56px |
| Botón secundario | 48px |
| Input | 52px |
| Item de lista clickable | 64px |

---

## Componentes (UI)

| Nombre | Uso |
|--------|-----|
| `.btn-primary` | Acción principal verde sólido. Altura 56px. |
| `.btn-secondary` | Acción secundaria con borde. |
| `.btn-ghost` | Acción terciaria sin borde. |
| `.btn-danger` | Acciones destructivas (suspender). |
| `.card` | Contenedor blanco, borde suave, radio 16px. |
| `.product-card` | Tarjeta de producto con foto cuadrada, título, precio "desde $X", rating. |
| `.price-tier` | Fila de tramo escalonado. |
| `.badge` | Pill pequeño (estado, comuna, categoría). |
| `.input` / `.textarea` | Campo de form con label sobre el input. |
| `.bottom-nav` | Tab bar inferior 4 secciones (Inicio, Buscar, Chat, Yo). |
| `.app-header` | Header sticky con logo + acciones. |
| `.disclaimer` | Banner amarillo claro fijo en chat. |
| `.rating-stars` | Estrellas amarillas SVG. |
| `.empty-state` | Estado vacío con ilustración placeholder + CTA. |

---

## Iconografía

SVG inline 24x24, `stroke-width: 1.6px`, color `currentColor`. Sin emojis en producción.
En los prototipos se usan SVGs simples.

---

## Tipo de imagen

- Fotos de producto: cuadradas (1:1), bordes redondeados 16px.
- Avatares: círculo, tamaño 40 / 56 / 96.
- Placeholders: degradado verde-bg pálido `linear-gradient(135deg, var(--brand-soft), var(--bg))`.

---

## Patrones

### Layout móvil

```
┌─────────────────────┐ <- safe area top
│   App Header 56px   │
├─────────────────────┤
│                     │
│   Contenido         │
│   padding 16px      │
│                     │
├─────────────────────┤
│   Bottom Nav 64px   │ <- 4 tabs
└─────────────────────┘ <- safe area bottom
```

### Form

- Labels sobre inputs, no flotantes.
- Errores en rojo bajo el input.
- Botón submit pegado al borde inferior con `padding: 16px`, `position: sticky` o full-width al final.

### Chat

- Mensajes propios alineados a la derecha, fondo `--brand-soft`.
- Mensajes del otro alineados a la izquierda, fondo `--surface` con borde.
- Disclaimer en banner amarillo arriba de la conversación.

---

## Accesibilidad

- Contraste texto/fondo ≥ 4.5:1 en cuerpo, ≥ 3:1 en grandes.
- Foco visible en todos los interactivos (`outline: 2px solid var(--brand); outline-offset: 2px`).
- Inputs con `inputmode` y `autocomplete` correctos (importante en celular).
- `aria-label` en iconos sin texto.
- Soporte de `prefers-reduced-motion`.

---

## Inventario de Pantallas

| Archivo | Ruta destino | Función |
|---------|--------------|---------|
| `index.html` | — | Gallery navegable de prototipos |
| `landing.html` | `/` | Landing con buscador y categorías |
| `catalog.html` | `/productos` | Catálogo con filtros |
| `product.html` | `/producto/[id]` | Detalle de producto |
| `login.html` | `/login` | Google + Phone OTP |
| `onboarding.html` | `/onboarding` | Completar perfil |
| `dashboard.html` | `/dashboard` | Resumen del usuario |
| `publish.html` | `/publicar` | Crear producto + tramos |
| `chat-list.html` | `/chat` | Bandeja de conversaciones |
| `chat-thread.html` | `/chat/[id]` | Chat real-time |
| `profile.html` | `/perfil/[id]` | Perfil público |
| `admin-reports.html` | `/admin/reportes` | Cola de reportes (admin) |

---

## Referencias

- Apple Human Interface Guidelines (espaciado, tipografía, tap targets).
- Material Design 3 (estados de input).
- Marketplace patterns: Facebook Marketplace, Mercado Libre (jerarquía precio + foto).
