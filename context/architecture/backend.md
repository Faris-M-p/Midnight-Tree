# Backend

## Model

- Supabase Data API + RLS for normal CRUD
- Edge Functions for:
  - Razorpay order creation
  - Payment verification
  - Webhooks
  - Access-token validation / session minting (trusted)
  - Other privileged subscription writes

## Secrets

| Secret | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser OK |
| Service role key | Edge Functions / server only |
| Razorpay key secret | Edge Functions only |
| Razorpay key id | Can be public for Checkout |

## No Midnight-Api

Do not revive .NET. Do not add a second Node API repo.
