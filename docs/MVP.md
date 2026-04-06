# Bull Weightlifting — MVP Scope

## Objetivo
E-commerce funcional de ropa deportiva Bull Weightlifting lista para producción en 4-5 semanas.

## Stack
- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **Pagos:** Mercado Pago Checkout Pro
- **Animaciones:** GSAP
- **Estado:** Zustand
- **Forms:** React Hook Form + Zod
- **Deploy:** Vercel

## Features MVP

### Semana 1 — Base + UX ✅
- [ ] Estructura App Router con route groups
- [ ] Design system: colores brand, tipografía, tokens
- [ ] Home: hero + categorías + CTA
- [ ] Navbar: glassmorphism, carrito, mobile menu
- [ ] Catálogo: grid responsivo + filtros
- [ ] Producto: galería, selector variantes, add to cart
- [ ] Carrito: drawer slide-right + edición
- [ ] Auth: login/registro con validación
- [ ] Perfil: datos personales + direcciones
- [ ] Admin base: dashboard + CRUD productos

### Semana 2 — Checkout + Pagos
- [ ] Flujo checkout: dirección → resumen → pago
- [ ] Integración Mercado Pago Checkout Pro
- [ ] Webhooks MP: actualización estado órdenes
- [ ] Página de confirmación post-pago
- [ ] Historial de órdenes (usuario + admin)
- [ ] Admin: gestión órdenes

### Semana 3 — Polish + Admin Completo
- [ ] Subida de imágenes a Supabase Storage
- [ ] Admin: gestión categorías
- [ ] Admin: reportes básicos
- [ ] SEO: metadatos dinámicos, sitemap
- [ ] Emails transaccionales (confirmación orden)

### Semana 4 — QA + Deploy
- [ ] Testing E2E: flujos críticos
- [ ] Optimización rendimiento (Core Web Vitals)
- [ ] Configuración dominio + variables producción
- [ ] Deploy Vercel producción
- [ ] Monitoreo básico (errores)

## Budget
$1,600 USD — 4-5 semanas
