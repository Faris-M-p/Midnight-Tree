# Coding rules

1. Only edit `midnight-web`. Never modify `Midnight-Tree` or `Midnight-Api`.
2. Prefer feature modules under `src/features/`.
3. Supabase client from `src/lib/supabase/`. No Firebase.
4. No service-role or Razorpay secret in client bundles.
5. Entitlements and permissions centralized.
6. Image adapter stub before R2.
7. Do not auto-start `next dev` unless the user asks.
8. Update matching `context/` docs when behavior changes.
