/**
 * =============================================================================
 * FILE: src/pages/LandingPage.tsx
 * ROLE: Public marketing / home page (static)
 * =============================================================================
 * Default route "/". No API calls. Links to Login and Register.
 * Sticky navbar + feature sections + footer.
 * =============================================================================
 */

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  Image,
  Laptop2,
  Link2,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users
} from "lucide-react";
import { PublicHeader } from "../components/layout/PublicHeader";

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const features = [
  {
    icon: GitBranch,
    title: "Interactive Family Tree",
    description: "Build and explore your family lineage with a visual, intuitive tree interface."
  },
  {
    icon: Users,
    title: "Member Management",
    description: "Create and maintain detailed family member profiles with structured information."
  },
  {
    icon: Clock3,
    title: "Timeline & Family History",
    description: "Track milestones across generations through a clean and searchable timeline."
  },
  {
    icon: Image,
    title: "Family Gallery",
    description: "Attach meaningful photos and media to preserve stories for future generations."
  },
  {
    icon: Link2,
    title: "Relationship Visualization",
    description: "Understand complex relationships with clear links between parents, spouses, and children."
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description: "Your family records are protected with modern authentication and secure API flows."
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Use the application seamlessly on desktop, tablet, and mobile devices."
  },
  {
    icon: Search,
    title: "Fast Search",
    description: "Find members and insights quickly with focused search and filtering experiences."
  }
];

const benefits = [
  "Easy to use, even for non-technical family members",
  "Beautiful and readable visual structure for complex trees",
  "Secure storage for sensitive family information",
  "Built with modern, reliable technology",
  "Responsive experience across all screen sizes"
];

function SocialIcon(props: { type: "github" | "linkedin" | "facebook" | "x" }) {
  if (props.type === "github") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12 .5a12 12 0 00-3.79 23.39c.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.62-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.64.24 2.86.12 3.16.77.84 1.24 1.92 1.24 3.23 0 4.63-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.23 0 1.61-.01 2.91-.01 3.31 0 .32.21.7.83.58A12 12 0 0012 .5z" />
      </svg>
    );
  }

  if (props.type === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9h4v12H3zM10 9h3.83v1.71h.05c.53-1.01 1.84-2.08 3.79-2.08C21.12 8.63 22 10.7 22 14.03V21h-4v-6.17c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.25V21h-4z" />
      </svg>
    );
  }

  if (props.type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M13.5 8H16V5h-2.5C10.46 5 9 6.57 9 9.32V11H7v3h2v5h3v-5h2.5l.5-3H12V9.5c0-.9.3-1.5 1.5-1.5z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.25 2h3.44l-7.52 8.6L23 22h-6.83l-5.35-7-6.13 7H1.25l8.04-9.2L1 2h7l4.84 6.4L18.25 2zm-1.2 18h1.9L6.98 3.9H4.94L17.05 20z" />
    </svg>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <PublicHeader pathname="/" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:pb-14 md:pt-10">
        <section id="home" className="grid items-center gap-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:grid-cols-2 md:p-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Family Legacy Platform
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">
              Build, preserve, and explore your family story.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Midnight Chronicle helps families map generations, document milestones, and preserve relationships in a modern visual experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">Family Tree Illustration</p>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                Product Mock
              </span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-300">
                  Founder
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-300">
                  Parents
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-300">
                  Descendants
                </div>
              </div>
              <div className="h-40 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-4">
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-emerald-500/30 text-center text-sm text-slate-300">
                  Placeholder product screenshot / tree mock
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16">
          <div className="mb-6">
            <h2 className="font-serif text-3xl text-white">Features built for family storytelling</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              Everything you need to organize, visualize, and preserve family history in one place.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-emerald-500/40"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-slate-100">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="about" className="mt-16 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-serif text-2xl text-white">Why choose Midnight Chronicle</h2>
            <ul className="mt-4 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-serif text-2xl text-white">How it works</h2>
            <ol className="mt-4 space-y-3">
              <li className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                <span className="font-semibold text-emerald-300">1. Create an account</span>
                <p className="mt-1">Start by registering your family admin profile in minutes.</p>
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                <span className="font-semibold text-emerald-300">2. Build your family tree</span>
                <p className="mt-1">Add members, relationships, and milestones with guided flows.</p>
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                <span className="font-semibold text-emerald-300">3. Explore generations</span>
                <p className="mt-1">Search, filter, and navigate your family legacy with ease.</p>
              </li>
            </ol>
          </article>
        </section>

        <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
          <h2 className="font-serif text-2xl text-white">Platform preview</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            A simple overview of how the product presents lineage, family history, and relationship details.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Laptop2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-slate-100">Tree View</p>
              <p className="mt-1 text-sm text-slate-400">Clean node-based visualization with expandable branches.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Clock3 className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-slate-100">Timeline View</p>
              <p className="mt-1 text-sm text-slate-400">Capture and explore milestones from every generation.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Image className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-slate-100">Gallery View</p>
              <p className="mt-1 text-sm text-slate-400">Attach memories and imagery to preserve your story visually.</p>
            </div>
          </div>
          <div className="mt-4 h-48 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-4">
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-emerald-500/30 text-center text-sm text-slate-300">
              Product screenshot placeholders
            </div>
          </div>
        </section>

        <section className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate("/login")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/95">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <section className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <GitBranch className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">Midnight Chronicle</p>
                <p className="text-xs text-slate-400">Family Tree Platform</p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Preserve generations, stories, and family history in one secure platform.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                aria-label="GitHub"
              >
                <SocialIcon type="github" />
              </a>
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                aria-label="LinkedIn"
              >
                <SocialIcon type="linkedin" />
              </a>
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                aria-label="Facebook"
              >
                <SocialIcon type="facebook" />
              </a>
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                aria-label="X (Twitter)"
              >
                <SocialIcon type="x" />
              </a>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-200">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => onNavigate("/")} className="text-slate-400 transition hover:text-emerald-300">
                  Home
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("/features")} className="text-slate-400 transition hover:text-emerald-300">
                  Features
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("/about")} className="text-slate-400 transition hover:text-emerald-300">
                  About
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("/login")} className="text-slate-400 transition hover:text-emerald-300">
                  Login
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("/register")} className="text-slate-400 transition hover:text-emerald-300">
                  Register
                </button>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-200">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="transition hover:text-emerald-300">Timeline</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">Gallery</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">Family Tree</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">Documentation</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">FAQ</a></li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-200">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="transition hover:text-emerald-300">Contact Us</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">Terms &amp; Conditions</a></li>
              <li><a href="#" className="transition hover:text-emerald-300">Help Center</a></li>
            </ul>
          </section>
        </div>

        <div className="border-t border-slate-800/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Midnight Chronicle. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
