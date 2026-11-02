import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatBytes } from "@/lib/image-utils/validate";

export const instant = false;

export default async function PlansPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Link href="/app" className="text-sm underline">
        Back
      </Link>
      <h1 className="text-2xl font-semibold">Plans</h1>
      <p className="text-sm text-neutral-500">
        Limits come from the database. Razorpay checkout activates paid plans via Edge Functions (stub ready).
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {(plans ?? []).map((p) => (
          <article
            key={p.id}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-xs text-neutral-500">{p.description}</p>
            <ul className="mt-3 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li>Owned families: {p.max_owned_families}</li>
              <li>Members: {p.max_members}</li>
              <li>Images: {formatBytes(Number(p.total_image_limit_bytes))}</li>
              <li>Per image: {formatBytes(Number(p.max_single_image_bytes))}</li>
              <li>Yearly: ₹{Number(p.yearly_price_inr)}</li>
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
