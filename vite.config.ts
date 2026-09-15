import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const FIREBASE_ENV_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
] as const;

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};

  for (const key of FIREBASE_ENV_KEYS) {
    const value = String(process.env[key] ?? fileEnv[key] ?? "").trim();
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  if (mode === "production") {
    const missing = FIREBASE_ENV_KEYS.filter(
      (key) => !String(process.env[key] ?? fileEnv[key] ?? "").trim()
    );
    if (missing.length > 0) {
      throw new Error(
        `Firebase env vars missing: ${missing.join(", ")}. In Vercel go to Settings → Environment Variables, add these VITE_FIREBASE_* keys for Production, then Redeploy.`
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    define,
    server: {
      host: true,
      allowedHosts: [".ngrok-free.app"]
    }
  };
});
