import { useEffect, useState } from "react";
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

interface LandingPageProps {
  onNavigate: (path: "/" | "/register" | "/login" | "/tree") => void;
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

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [activeSection, setActiveSection] = useState<"home" | "features" | "about">("home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "features" || hash === "about" || hash === "home") {
        setActiveSection(hash);
      } else {
        setActiveSection("home");
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToSection = (section: "home" | "features" | "about") => {
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.history.replaceState({}, "", `/#${section}`);
    setActiveSection(section);
  };

  const navLinkClass = (section: "home" | "features" | "about") =>
    `rounded-lg px-3 py-2 text-sm transition ${
      activeSection === section
        ? "bg-emerald-500/20 text-emerald-300"
        : "text-slate-300 hover:text-emerald-300"
    }`;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "border-b border-slate-800/90 bg-slate-950/85 shadow-lg shadow-black/20 backdrop-blur-md"
            : "border-b border-slate-800/60 bg-slate-950/70 backdrop-blur"
        }`}
      >
        <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="inline-flex items-center gap-2 text-left"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <GitBranch className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-100">Midnight Chronicle</span>
              <span className="block text-xs text-slate-400">Family Tree Platform</span>
            </span>
          </button>

          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <button type="button" onClick={() => navigateToSection("home")} className={navLinkClass("home")}>
              Home
            </button>
            <button type="button" onClick={() => navigateToSection("features")} className={navLinkClass("features")}>
              Features
            </button>
            <button type="button" onClick={() => navigateToSection("about")} className={navLinkClass("about")}>
              About
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/login")}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:text-emerald-300"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/register")}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Register
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-28 md:pb-14 md:pt-32">
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
                Login
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("/register")}
                className="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-500 hover:text-emerald-300"
              >
                Register
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

        <section className="mt-16 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-slate-900 p-6 md:p-10">
          <h2 className="font-serif text-3xl text-white">Start preserving your family legacy today</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Create your account and begin building a timeless, shareable history of your family journey.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate("/login")}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/register")}
              className="rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Register
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>Midnight Chronicle</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="transition hover:text-emerald-300">Privacy Policy</a>
            <a href="#" className="transition hover:text-emerald-300">Terms</a>
            <a href="#" className="transition hover:text-emerald-300">Contact</a>
            <span>Version 1.0.0</span>
          </div>
          <p>© {new Date().getFullYear()} Midnight Chronicle</p>
        </div>
      </footer>
    </div>
  );
}
