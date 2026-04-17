---
name: cod-detection-expertise
description: How to detect Cash-on-Delivery orders in this codebase via payment_id prefix
triggers:
  - contraentrega
  - cash on delivery
  - COD
  - payment_id
  - startsWith
scope: project
---

# COD Detection via payment_id Prefix

## The Insight
COD orders are identified by checking `payment_id.startsWith("CONTRAENTREGA")`, not by a separate column or enum field. The `payment_id` is stored as `${paymentMethod.toUpperCase()}-${Date.now()}` (e.g. `CONTRAENTREGA-1711234567890`), so the method is encoded in the prefix.

## Why This Matters
If you add COD-conditional logic (different email copy, WhatsApp message, UI notice) and query a `payment_method` column or enum, you'll get nothing — that column doesn't exist. The only source of truth is the `payment_id` string prefix.

## Recognition Pattern
Any time you need to branch on "is this a COD order?":
- You're in `checkout.ts`, `orders.ts`, `email.ts`, or `whatsapp.ts`
- You see a condition like "show COD notice" or "skip payment confirmation"

## The Approach
```typescript
// Correct
const isCOD = order.payment_id.startsWith("CONTRAENTREGA");

// Wrong — this column does not exist
const isCOD = order.payment_method === "contraentrega";
```

Always use the prefix check. All notification templates (`email.ts`, `whatsapp.ts`) already follow this pattern — stay consistent.
