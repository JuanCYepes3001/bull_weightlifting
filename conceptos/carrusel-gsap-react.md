---
tags: [concepto, gsap, react, carrusel, animacion, next]
aliases: [carousel gsap, carrusel animado]
date: 2026-05-03
---

# Carrusel GSAP en React / Next.js

## Qué es

Un carrusel construido con GSAP en lugar de librerías de slides (Swiper, Embla, etc.). Todos los slides se renderizan en el DOM simultáneamente en la misma celda CSS grid; GSAP controla la opacidad y z-index para mostrar uno a la vez.

## Por qué no usar crossfade puro

Con crossfade simultáneo (fade-out + fade-in al mismo tiempo), durante la transición ambos slides tienen opacidad > 0. El texto del slide anterior "sangra" a través del slide siguiente semi-transparente, creando un solapamiento visible.

**Solución:** transición en secuencia:
1. Fade-out del slide anterior (0.35s)
2. Breve momento en negro (~50ms)
3. Fade-in del nuevo slide (0.55s) con texto en stagger

## Patrón de implementación

```tsx
// Todos los slides en la misma celda grid
<div className="grid">
  {slides.map((s, i) => (
    <div
      key={i}
      ref={el => slideEls.current[i] = el}
      className="col-start-1 row-start-1"  // misma celda
      style={{ opacity: 0, zIndex: 0 }}    // todos ocultos por defecto
    >
      {/* contenido del slide */}
    </div>
  ))}
</div>
```

```ts
// Transición sin solapamiento
const tl = gsap.timeline();
tl.to(prevEl, { opacity: 0, duration: 0.35, ease: "power2.in" });
tl.set(prevEl, { zIndex: 0 });
tl.set(nextEl, { opacity: 0, zIndex: 1 });
tl.to(nextEl, { opacity: 1, duration: 0.55 }, "+=0.05");
tl.to(textEls, { y: 0, opacity: 1, stagger: 0.12 }, "-=0.3");
```

## Por qué CSS grid en lugar de `absolute inset-0`

Con `absolute inset-0`, la sección necesita altura explícita (`min-h`). Con `col-start-1 row-start-1`, la altura de la celda = el slide más alto → se adapta al contenido automáticamente.

## Consistencia visual de imágenes

Si los slides tienen imágenes de distintos aspect ratios y usas `object-contain`, cada imagen aparece a diferente escala → se ve inconsistente. La solución correcta:

- `min-h-[62vh]` en cada slide (altura fija igual para todos)
- Columna de imagen con `py-14` (margen top/bottom uniforme)
- `flex-1` en el contenedor interno → la imagen llena exactamente el espacio disponible
- `object-cover object-top` → todas las imágenes tienen el mismo alto en píxeles, ancladas desde arriba

## Auto-avance con reseteo al navegar

```ts
const resetTimer = () => {
  clearInterval(timerRef.current);
  timerRef.current = setInterval(advance, 6000);
};
// Llamar resetTimer() al hacer click en flechas o dots
```

## Relacionados

- [[conceptos/supabase-admin-client-rls]] — cómo listar un bucket para obtener las URLs
- [[conceptos/patron-antisync-refs]] — uso de refs para evitar stale closures en timers
