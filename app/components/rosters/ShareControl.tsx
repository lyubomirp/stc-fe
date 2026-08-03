"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/app/data/api";

const BTN =
  "border px-5 py-2 font-amsterdam text-xs font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-40";

// Mint / show / revoke the guest link for one army. The token is a secret the
// API holds, so this component never derives it -- it asks, and renders what it
// is given.
const ShareControl: React.FC<{
  rosterId: string;
  initialToken: string | null;
}> = ({ rosterId, initialToken }) => {
  const [token, setToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // window is not there during the server render, and the link must be absolute
  // to be worth copying, so the origin arrives after mount.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const url = token ? `${origin}/shared/${token}` : "";

  const share = async () => {
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/rosters/${rosterId}/share`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(String(res.status));

      const body = (await res.json()) as { token: string };
      setToken(body.token);
    } catch {
      setError("Could not create the link");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/rosters/${rosterId}/share`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(String(res.status));

      setToken(null);
      setCopied(false);
    } catch {
      setError("Could not revoke the link");
    } finally {
      setBusy(false);
    }
  };

  // clipboard is unavailable outside a secure context, so the URL is also on
  // screen in a readonly input -- the copy button is the convenience, not the
  // only way to get the link.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy it from the box");
    }
  };

  if (!token) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className={`${BTN} border-white/25 text-white/80 hover:border-white hover:text-white`}
        >
          {busy ? "Creating…" : "Share list"}
        </button>
        {error && (
          <span className="font-mono text-[10px] tracking-[0.1em] text-red-400">
            {error.toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Share link"
        className="w-[22rem] max-w-full border border-white/15 bg-black/40 px-3 py-2 font-mono text-[11px] text-white/70 focus:border-[color:var(--accent)] focus:outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className={`${BTN} border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-black`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={revoke}
        disabled={busy}
        className={`${BTN} border-white/10 text-white/40 hover:border-red-400/60 hover:text-red-400`}
      >
        {busy ? "Revoking…" : "Revoke"}
      </button>
      <span className="font-mono text-[10px] tracking-[0.1em] text-white/35">
        {error ? (
          <span className="text-red-400">{error.toUpperCase()}</span>
        ) : (
          "ANYONE WITH THIS LINK CAN READ THIS LIST"
        )}
      </span>
    </div>
  );
};

export default ShareControl;
