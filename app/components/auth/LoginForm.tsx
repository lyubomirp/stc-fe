"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/data/api";

const LoginForm: React.FC<{ next: string }> = ({ next }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // The API says the same thing for a wrong address and a wrong password;
        // repeating its message keeps it that way rather than inventing a more
        // specific one here.
        setError(
          res.status === 401
            ? "Incorrect email or password."
            : `Could not sign in (${res.status}).`,
        );
        return;
      }

      // refresh() first: the gated pages are server-rendered, and without it
      // they would re-render from a cache taken while signed out.
      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-8"
      >
        <div className="font-amsterdam text-3xl font-bold tracking-wide text-white">
          STC
        </div>
        <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-white/40">
          AUTHORISATION REQUIRED
        </p>

        <label className="mt-8 block font-mono text-[11px] tracking-[0.1em] text-white/45">
          EMAIL
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border border-white/15 bg-black/40 px-3 py-2 font-sans text-sm text-white outline-none focus:border-fuchsia-400"
          />
        </label>

        <label className="mt-4 block font-mono text-[11px] tracking-[0.1em] text-white/45">
          PASSWORD
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full border border-white/15 bg-black/40 px-3 py-2 font-sans text-sm text-white outline-none focus:border-fuchsia-400"
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 font-mono text-[11px] text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full bg-fuchsia-500 px-5 py-2.5 font-amsterdam text-sm font-bold uppercase tracking-[0.1em] text-black transition-[filter] hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <p className="mt-6 font-mono text-[10px] leading-relaxed text-white/30">
          Accounts are created by an administrator. There is no self-service
          registration.
        </p>
      </form>
    </main>
  );
};

export default LoginForm;
