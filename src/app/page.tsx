import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Midnight</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Family tree for your whole family story
      </h1>
      <p className="mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
        Build a multi-generation tree, invite collaborators, and keep ownership with the Account Owner.
        Inspired by Lineage-style interaction — implemented on Next.js and Supabase.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium dark:border-neutral-700"
        >
          Sign in
        </Link>
        <Link href="/app" className="rounded-md px-4 py-2.5 text-sm font-medium text-neutral-600 underline">
          Open app
        </Link>
      </div>
    </main>
  );
}
