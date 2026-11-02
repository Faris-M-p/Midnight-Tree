/**
 * Stub: verify Razorpay payment signature, then activate subscription row.
 */
Deno.serve(async () => {
  return new Response(
    JSON.stringify({ error: "Not wired yet.", ok: false }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
});
