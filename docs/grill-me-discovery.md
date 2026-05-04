# Grill-Me Discovery — Punto de Venta Agricultura

> Sesión completa de descubrimiento realizada por El Arquitecto.
> Fecha: 2026-05-04
> Estado: **Fase 3 completada (Arquitectura propuesta). Pendiente confirmación para generar blueprint.**

---

## Fase 1 — Discovery (Completada ✅)

### Pregunta 1: ¿Cuál es el problema principal?
**R:** Son dos problemas simultáneos:
- **Precio:** Los agricultores reciben muy poco porque hay 3-4 intermediarios que encarecen la cadena.
- **Acceso al mercado:** Los agricultores no saben a quién venderle directamente.

### Pregunta 2: ¿Quién es el comprador?
**R:** Todos los anteriores — consumidores finales, restaurantes/cocinas, ferias y locales. Marketplace mixto (B2C + B2B). Mientras más se compra, más barato (descuentos por volumen).

### Pregunta 3: ¿Cómo se resuelve la logística?
**R:** No está definido aún. La plataforma no gestiona logística. El default es retiro en el lugar del agricultor, pero comprador y vendedor pueden acordar punto intermedio o contratar un operador logístico externo. Todo se negocia por chat.

### Pregunta 4: ¿País y contexto?
**R:** Chile. La plataforma funciona como un Facebook Marketplace — facilita la conexión, no intermedia. Comprador y vendedor se ponen de acuerdo entre ellos.

### Pregunta 5: ¿Modelo de negocio?
**R:** MVP gratuito. Monetización se define después con datos reales de uso. Posibilidades futuras: suscripción, comisión, o publicidad.

### Pregunta 6: ¿Experiencia del agricultor?
**R:** 
- Subir foto desde celular y poner precio con tramos de volumen.
- Ejemplo: 200kg de tomate → $2.000/kg base, >10kg → $1.500, >30kg → $1.300.
- Recibir mensajes por chat in-app.
- El chat sirve como registro informal de acuerdos (protección legal básica).
- Disclaimer: la plataforma facilita pero no se hace responsable.

### Pregunta 7: ¿Sistema de confianza?
**R:** Sí, desde el MVP:
- Valoraciones bidireccionales (comprador ↔ vendedor).
- Sistema de reportes (ambos lados pueden reportar).

### Pregunta 8: ¿Administración?
**R:** Panel admin simple. Solo 2 personas (los fundadores) revisan reportes y pueden suspender cuentas.

### Pregunta 9: ¿Definición de "listo"?
**R:** El flujo completo es el MVP mínimo. Todo lo conversado debe funcionar. Features futuros: pagos integrados, pagos anticipados, contratos con firma digital avanzada.

### Pregunta 10: ¿Web o app nativa?
**R:** Web app mobile-first. Sin descarga, funciona desde el navegador.

### Pregunta 11: ¿Registro e identificación?
**R:** Login con Google o número de celular. Perfil con datos básicos: nombre, empresa/puesto (o nombre personal si no tiene empresa formalizada).

### Pregunta 12: ¿Alcance geográfico?
**R:** Piloto en La Serena / Coquimbo. Arquitectura diseñada para escalar a todo Chile.

### Resumen de Alcance (Confirmado ✅)
1. Problema: Agricultores pierden dinero y acceso al mercado por 3-4 intermediarios.
2. Solución: Marketplace tipo Facebook Marketplace — conecta sin intermediar pagos ni logística.
3. Compradores: Consumidores, restaurantes, ferias/locales.
4. Precios: Tramos escalonados por volumen definidos por el vendedor.
5. Logística: Fuera de la plataforma — se acuerda por chat.
6. Chat in-app: Vinculado a producto específico, registro informal de acuerdos.
7. Confianza: Valoración bidireccional + reportes.
8. Admin: Panel simple para 2 personas.
9. Auth: Google + teléfono + perfil flexible.
10. Modelo de negocio: Gratuito en MVP.
11. Plataforma: Web app mobile-first.
12. Geografía: La Serena/Coquimbo → todo Chile.
13. Disclaimer: La plataforma no se responsabiliza por transacciones.

---

## Fase 2 — Deep Dive Técnico (Completada ✅)

### Archetype: Marketplace

### Stack Confirmado

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Frontend | Next.js 14+ (App Router) | SSR para SEO de productos, mobile-first, API routes integradas |
| Auth | Supabase Auth | Google OAuth + Phone OTP ya incluido |
| Base de datos | Supabase (PostgreSQL) | RLS para seguridad multi-usuario, real-time incluido |
| Chat real-time | Supabase Realtime | Integrado, sin servicio externo adicional |
| Imágenes | Supabase Storage | Upload desde celular, CDN, resize |
| Hosting | Vercel | Par natural de Next.js, tier gratuito generoso |
| PWA | next-pwa | Instalable desde navegador como app |

### Decisiones Técnicas

1. **Chat:** 1 a 1 vinculado a un producto específico. Sin notificaciones push en MVP.
2. **Categorías:** Predefinidas en árbol jerárquico (ej: Verduras > Tomate). El vendedor selecciona, no escribe libre.
3. **Blueprint:** Debe ser ultra explicativo, como si lo leyera alguien que no estuvo en la conversación.
4. **Perfil técnico del fundador:** 6 años de backend en banca con Java + conoce Next.js/Supabase/Vercel.

---

## Fase 3 — Arquitectura Propuesta (Completada ✅, Pendiente Confirmación Final)

### Modelo de Datos

```
usuarios         → id, rol (vendedor/comprador/admin), nombre, nombre_negocio,
                    teléfono, comuna, avatar, creado_en

categorías       → id, nombre, categoría_padre (ej: Verduras > Tomate)

productos        → id, vendedor_id, categoría_id, título, descripción,
                    unidad_medida (kg/unidad/caja), stock, ubicación,
                    fotos[], estado (activo/pausado), creado_en

tramos_precio    → id, producto_id, cantidad_mínima, precio_por_unidad
                    (ej: 0kg→$2000, 10kg→$1500, 30kg→$1300)

conversaciones   → id, producto_id, comprador_id, vendedor_id, estado, creado_en

mensajes         → id, conversación_id, emisor_id, contenido, creado_en

valoraciones     → id, evaluador_id, evaluado_id, conversación_id,
                    puntaje (1-5), comentario, creado_en

reportes         → id, reportante_id, reportado_id, conversación_id,
                    motivo, estado (pendiente/revisado/resuelto),
                    notas_admin, creado_en
```

### Páginas Principales

| Ruta | Función |
|------|---------|
| `/` | Landing con buscador de productos |
| `/productos` | Catálogo con filtros (categoría, precio, valoración) |
| `/producto/[id]` | Detalle del producto + botón "Contactar vendedor" |
| `/perfil/[id]` | Perfil público con valoraciones y productos activos |
| `/dashboard` | Panel del usuario (mis productos / mis conversaciones) |
| `/chat/[id]` | Chat vinculado a un producto específico |
| `/admin` | Panel admin (reportes, gestión de usuarios, suspensiones) |

### Flujo Principal

```
Agricultor se registra → Completa perfil → Publica producto con foto y tramos de precio
                                                        ↓
Comprador busca → Encuentra producto → Abre chat vinculado al producto
                                                        ↓
                    Negocian por chat (precio, cantidad, retiro)
                                                        ↓
                Cierran trato fuera de la app → Se valoran mutuamente
```

---

## Siguiente Paso

> **ESTADO ACTUAL: Fase 3 completada. Falta confirmación del usuario para avanzar a Fase 4 (Generación del Blueprint).**
>
> Para continuar, cualquier agente debe:
> 1. Leer este documento y CONTEXT.md
> 2. Pedir confirmación de la arquitectura propuesta
> 3. Generar el blueprint autocontenido siguiendo `.ai-core/claude/architect-grill-me.xml` Fase 4
>
> El blueprint debe incluir:
> - Resumen del proyecto
> - Tech Stack con rationale
> - Arquitectura (diagrama Mermaid)
> - Modelo de datos completo
> - CONTEXT.md (ya generado)
> - ADRs (Architecture Decision Records)
> - Build Order numerado
> - Criterios de éxito verificables
> - Reglas para el ejecutor

---

## Features para v2 (No incluir en MVP)

- Pagos integrados (Transbank, Khipu, transferencia)
- Pagos anticipados / reservas
- Contratos con firma digital avanzada
- Notificaciones push
- Operador logístico como tercer actor
- Expansión geográfica a todo Chile
- Monetización de la plataforma
