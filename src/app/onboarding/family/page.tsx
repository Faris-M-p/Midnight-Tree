import { redirect } from "next/navigation";
import { CreateFamilyForm } from "@/features/family/CreateFamilyForm";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const instant = false;

export default async function OnboardingFamilyPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
        <CreateFamilyForm />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <CreateFamilyForm />
    </div>
  );
}
