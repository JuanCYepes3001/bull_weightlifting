---
tags: [proyecto, ecommerce, nextjs, supabase]
created: 2026-04-11
aliases: [bull, Bull Weightlifting]
---

# Bull Weightlifting — Proyecto

E-commerce de ropa deportiva de alto rendimiento.

## Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind v4
- **Backend/DB**: Supabase (Auth, PostgreSQL, RLS)
- **Estado cliente**: Zustand + persist middleware
- **Animaciones**: GSAP + ScrollTrigger
- **Notificaciones**: WhatsApp (sin SDK, fetch directo) + Email (Resend, fetch directo)
- **Pagos**: Contraentrega (COD) + Nequi + Bancolombia

## Módulos principales
- `/src/app/(shop)` — tienda pública
- `/src/app/admin` — panel de administración
- `/src/app/(auth)` — autenticación
- `/src/app/(profile)` — perfil de usuario
- `/src/app/actions` — Server Actions

## Notas relacionadas
- [[diario/2026-04-11]] — Sesión 2026-04-11: cart sync, trusas, dashboard charts
- [[diario/2026-04-12]] — Sesión 2026-04-12: tipos Supabase, Realtime cart sync, bugs auth/UI, email verificación
- [[diario/2026-04-16]] — Auditoría de seguridad completa (Cyber Neo) + 3 fixes críticos
