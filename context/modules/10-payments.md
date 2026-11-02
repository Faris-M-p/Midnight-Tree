# M10 — Razorpay payments

## Flow

1. Client requests order via Edge Function  
2. Function loads plan from DB, creates Razorpay order with secret  
3. Checkout in browser  
4. Client sends result to verify Edge Function  
5. Signature check → activate subscription  
6. Webhook Edge Function for async events (idempotent)

## Rules

- Yearly only in v1
- Never trust client-only success
- Secrets only on Edge
