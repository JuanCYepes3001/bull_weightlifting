---
tags: [concepto, seguridad, auth, server-actions, rate-limiting]
created: 2026-04-16
aliases: [limitación de tasa, throttling, brute force protection, CWE-307]
---

# Rate Limiting

El **rate limiting** restringe cuántas veces un usuario o IP puede realizar una operación en un período de tiempo. Sin él, cualquier endpoint puede ser atacado por fuerza bruta o flood ilimitado.

Es especialmente crítico en endpoints de autenticación: login, registro, recuperación de contraseña, verificación de OTP.

---

## El problema: sin límite de intentos

```typescript
// ❌ SIN rate limiting — brute force trivial
export async function loginAction(formData: FormData) {
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  // Un atacante puede hacer 100.000 intentos por segundo
}

export async function requestPasswordResetAction(formData: FormData) {
  await supabase.auth.resetPasswordForEmail(email);
  // Un atacante puede spamear el email de cualquier usuario sin límite
}
```

---

## Implementación in-memory (single-instance)

Simple, sin dependencias. Funciona para servidor único o durante desarrollo.

```typescript
// Simple rate limiter con Map + TTL
const _rateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = _rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    _rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return false; // primera request en la ventana — permitida
  }
  if (entry.count >= max) return true; // límite alcanzado — bloqueada
  entry.count++;
  return false;
}

// Uso en loginAction — 10 intentos / 15 min por IP
export async function loginAction(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return { error: "Demasiados intentos. Espera 15 minutos." };
  }
  // ...
}

// Uso en requestPasswordResetAction — 3 emails / 15 min por email
export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (isRateLimited(`reset:${email.toLowerCase()}`, 3, 15 * 60 * 1000)) {
    return { error: "Ya enviamos un correo recientemente. Espera 15 minutos." };
  }
  // ...
}
```

---

## Limitación: in-memory no escala en serverless

El `Map` vive en la memoria del proceso. En Vercel (funciones serverless), cada request puede ir a una instancia diferente — el Map se resetea por instancia.

```
Instancia A: usuario hace 9 intentos → casi en el límite
Instancia B: usuario hace 9 intentos más → también "casi en el límite"
Total real: 18 intentos, el rate limiter creyó que eran 9
```

**Para producción multi-instancia → @upstash/ratelimit + Redis:**

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"),
});

export async function loginAction(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(`login:${ip}`);
  if (!success) return { error: "Demasiados intentos." };
}
```

---

## Claves de rate limiting bien elegidas

| Endpoint | Clave | Lógica |
|----------|-------|--------|
| Login | `login:{ip}` | Ataques de fuerza bruta vienen de IPs |
| Password reset | `reset:{email}` | Flood de emails se hace contra emails concretos |
| Registro | `register:{ip}` | Creación masiva de cuentas desde misma IP |
| OTP / 2FA | `otp:{userId}` | El atacante ya tiene la cuenta, se limita por usuario |

---

## En Bull Weightlifting

Implementado el 2026-04-16 en `src/app/actions/auth.ts` con el Map in-memory. La limitación de multi-instancia está documentada en el comentario del código. Pendiente migrar a `@upstash/ratelimit` antes del deploy en Vercel.

---

## Conceptos relacionados

- [[conceptos/middleware-vs-layout-auth]] — otra capa de protección, pero diferente: autorización vs limitación de intentos
- [[conceptos/server-action-redirect]] — Server Actions son donde se aplica el rate limiting en Next.js
