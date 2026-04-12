---
name: no-sdk-notifications-expertise
description: Convention — all external notification APIs use raw fetch, never npm SDKs
triggers:
  - twilio
  - resend
  - whatsapp
  - email
  - notification
  - SDK
  - npm install
scope: project
---

# No-SDK Notification Convention

## The Insight
All external notification services (Twilio WhatsApp, Resend email) use raw `fetch` calls against REST APIs — no npm SDKs. Calls are fire-and-forget (`void`), never awaited in the action flow.

## Why This Matters
If you `npm install twilio` or `npm install resend`, you're going against the established pattern. The raw-fetch approach keeps the bundle lean and avoids SDK version churn. Adding `await` to notification calls would block the checkout/order-update response unnecessarily.

## Recognition Pattern
- You're adding a new notification channel or extending an existing one
- You're tempted to install an official SDK for Twilio, Resend, SendGrid, etc.
- You see `src/lib/whatsapp.ts` or `src/lib/email.ts` as the model

## The Approach
```typescript
// Correct — raw fetch, fire-and-forget
export async function sendMyNotification(to: string, data: MyData) {
  const response = await fetch("https://api.service.com/v1/endpoint", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SERVICE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, ...data }),
  });
  // optionally log errors, but don't throw
}

// In the calling action — non-blocking:
void sendMyNotification(email, orderData);
```

**Env var naming convention:** `SERVICE_API_KEY` and `SERVICE_FROM` (e.g. `RESEND_API_KEY`, `EMAIL_FROM`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`).
