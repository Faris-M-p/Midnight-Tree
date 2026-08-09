import { PublicHeader } from "../components/layout/PublicHeader";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader pathname="/about" />
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="font-serif text-4xl text-white">About Midnight Chronicle</h1>
        <p className="text-slate-300 leading-relaxed">
          Families outgrow scattered albums, chat threads, and spreadsheets. Midnight Chronicle is a private place to keep
          the tree, the stories, the photographs, and the dates that matter — so the next generation still knows who they come from.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Administrators stay inside the same family application. There is no separate admin product and no business dashboard.
          If you hold the right permission, you simply get Access Tokens so relatives can visit with a scoped family pass.
        </p>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="font-semibold">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>Register your family and sign in with your admin account.</li>
            <li>Add members and grow the tree with parent, spouse, and child connections.</li>
            <li>Collect stories, albums, timeline moments, and events around the people you love.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
