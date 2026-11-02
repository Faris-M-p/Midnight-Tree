/**
 * Stub: validate webhook signature, idempotent event store, update subscription.
 */
Deno.serve(async () => {
  return new Response(
    JSON.stringify({ error: "Not wired yet.", ok: false }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
});
