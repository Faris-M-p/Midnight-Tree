/**
 * Stub Edge Function — deploy to Supabase with Razorpay secrets.
 * Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (never NEXT_PUBLIC_).
 *
 * Flow: verify JWT → load plan from DB → create Razorpay order → return order id.
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  return new Response(
    JSON.stringify({
      error: "Not wired yet. Set Razorpay secrets and implement order creation.",
      ok: false
    }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
});
