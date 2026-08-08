import { Clock3, GitBranch, Image, Link2, Search, ShieldCheck, Smartphone, Users } from "lucide-react";
import { PublicHeader } from "../components/layout/PublicHeader";

const features = [
  { icon: GitBranch, title: "Interactive Family Tree", description: "Explore lineage with a visual tree that keeps parent, spouse, and child relationships clear." },
  { icon: Users, title: "Member Management", description: "Search, filter, and maintain detailed profiles across hundreds of relatives." },
  { icon: Clock3, title: "Timeline & History", description: "Follow births, marriages, migrations, and achievements across generations." },
  { icon: Image, title: "Family Gallery", description: "Keep albums and photos beside the people and stories they belong to." },
  { icon: Link2, title: "Stories & Events", description: "Publish family stories and gather around birthdays, anniversaries, and reunions." },
  { icon: ShieldCheck, title: "Private by design", description: "Password login and family tokens keep your chronicle inside the family." },
  { icon: Smartphone, title: "Responsive", description: "A calm desktop layout and a mobile drawer built for family use." },
  { icon: Search, title: "Fast search", description: "Find members, stories, and moments without digging through a dashboard." }
];

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicHeader active="features" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-serif text-4xl text-white">Features</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Midnight Chronicle is a private family legacy platform — not a CRM. These tools help you remember people, not manage accounts.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="mt-3 font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
