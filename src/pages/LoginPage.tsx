interface LoginPageProps {
  onNavigate: (path: "/" | "/register" | "/login") => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-2xl shadow-black/30">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
        <h1 className="mt-2 font-serif text-3xl">Login</h1>
        <p className="mt-3 text-sm text-slate-400">
          Login page integration will be added in the next task.
        </p>

        <button
          type="button"
          onClick={() => onNavigate("/register")}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Back to Register
        </button>
      </div>
    </div>
  );
}
