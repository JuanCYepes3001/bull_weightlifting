---
name: supabase-user-email-lookup-expertise
description: How to get a user's email from an order in this codebase — must use admin client
triggers:
  - user email
  - getUserById
  - order email
  - admin client
  - auth.admin
scope: project
---

# Supabase User Email Lookup from Orders

## The Insight
Orders do not store user email directly. To send a notification for an existing order, you must look up the email via `createAdminClient().auth.admin.getUserById(order.user_id)`. The regular client cannot access `auth.admin`.

## Why This Matters
If you try `supabase.from('profiles').select('email')` or access `order.email`, you'll get nothing — email lives in Supabase Auth, not in the `profiles` table or the `orders` table. This lookup requires the service-role admin client.

## Recognition Pattern
- You're in a server action (e.g. `orders.ts`) updating order status
- You need to send an email notification but only have `order.user_id`
- The function already has a regular supabase client but NOT the user's email

## The Approach
```typescript
import { createAdminClient } from "@/lib/supabase/admin";

// Inside your server action:
const adminClient = createAdminClient();
const { data: userData } = await adminClient.auth.admin.getUserById(order.user_id);
const userEmail = userData?.user?.email;

if (userEmail) {
  await sendShippedEmail(userEmail, { /* order details */ });
}
```

**Contrast with checkout.ts:** At checkout time, the user is authenticated and `user.email` is available directly from the session — no admin lookup needed. The admin lookup pattern is only required post-checkout (e.g. status updates in `orders.ts`).
