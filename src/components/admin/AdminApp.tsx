"use client";

import { Lock } from "lucide-react";
import { FormEvent, useState } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

type AdminPageProps = {
  configured: boolean;
  authenticated: boolean;
};

export function AdminApp({ configured, authenticated }: AdminPageProps) {
  const [loggedIn, setLoggedIn] = useState(authenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Login failed.");
      }

      setLoggedIn(true);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8 text-center">
          <h1 className="text-xl font-medium text-white">Admin not configured yet</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/45">
            Add <code className="text-white/70">ADMIN_PASSWORD</code> in Vercel → Settings →
            Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8"
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40">
            <Lock className="h-5 w-5 text-white/70" />
          </div>
          <h1 className="text-2xl font-medium text-white">Portfolio Admin</h1>
          <p className="mt-2 text-sm text-white/45">
            Sign in to update videos, titles, and contact info without touching code.
          </p>

          <label className="mt-8 block">
            <span className="mb-2 block text-[11px] tracking-[0.2em] text-white/35 uppercase">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              placeholder="Enter admin password"
              required
            />
          </label>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}
