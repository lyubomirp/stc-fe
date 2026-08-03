"use client";
import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/app/data/api";

const BTN =
  "border px-5 py-2 font-amsterdam text-xs font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-40";

const remaining = (iso: string | null): number =>
  iso ? Math.max(0, new Date(iso).getTime() - Date.now()) : 0;

const countdown = (ms: number): string => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

// Mint / show / revoke the guest link for one army. The token is a secret the
// API holds, so this component never derives it -- it asks, and renders what it
// is given. Same for the expiry: the TTL lives on the server and arrives as an
// absolute timestamp, so this file has no idea how long 'a share' is.
const ShareControl: React.FC<{
  rosterId: string;
  initialToken: string | null;
  initialExpiresAt: string | null;
}> = ({ rosterId, initialToken, initialExpiresAt }) => {
  const [token, setToken] = useState(initialToken);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // window is not there during the server render, and the link must be absolute
  // to be worth copying, so the origin arrives after mount.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  // null until mounted: a countdown rendered on the server is wrong by the time
  // it reaches the browser, and rendering a different number during hydration
  // is a mismatch. Ticking every second is cheap and this window is short.
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    setLeft(remaining(expiresAt));
    const t = setInterval(() => setLeft(remaining(expiresAt)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  // Expired is the same as unshared as far as this control is concerned -- the
  // link is dead either way and the only useful action is to make a new one.
  // Before mount `left` is null, so an existing token renders as live and the
  // countdown fills in; the API is what actually enforces this.
  const live = Boolean(token) && (left === null || left > 0);

  const url = token ? `${origin}/shared/${token}` : "";

  const share = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/rosters/${rosterId}/share`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(String(res.status));

      const body = (await res.json()) as {
        token: string;
        expiresAt: string;
      };
      setToken(body.token);
      setExpiresAt(body.expiresAt);
      setCopied(false);
    } catch {
      setError("Could not create the link");
    } finally {
      setBusy(false);
    }
  }, [rosterId]);

  const revoke = async () => {
    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/rosters/${rosterId}/share`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(String(res.status));

      setToken(null);
      setExpiresAt(null);
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

  if (!live) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className={`${BTN} border-white/25 text-white/80 hover:border-white hover:text-white`}
        >
          {busy ? "Creating…" : token ? "New share link" : "Share list"}
        </button>
        <span className="font-mono text-[10px] tracking-[0.1em] text-white/35">
          {error ? (
            <span className="text-red-400">{error.toUpperCase()}</span>
          ) : token ? (
            "THAT LINK HAS EXPIRED"
          ) : (
            "GUEST LINKS EXPIRE — CHECK THE COUNTDOWN AFTER SHARING"
          )}
        </span>
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
        onClick={share}
        disabled={busy}
        title="Push the expiry back out; the link itself does not change"
        className={`${BTN} border-white/15 text-white/50 hover:border-white/60 hover:text-white`}
      >
        {busy ? "…" : "Extend"}
      </button>
      <button
        type="button"
        onClick={revoke}
        disabled={busy}
        className={`${BTN} border-white/10 text-white/40 hover:border-red-400/60 hover:text-red-400`}
      >
        {busy ? "Revoking…" : "Revoke"}
      </button>
      <span className="font-mono text-[10px] tracking-[0.1em]">
        {error ? (
          <span className="text-red-400">{error.toUpperCase()}</span>
        ) : (
          <span
            className={
              left !== null && left < 120000 ? "text-red-400" : "text-white/35"
            }
          >
            {left === null ? " " : `EXPIRES IN ${countdown(left)}`}
          </span>
        )}
      </span>
    </div>
  );
};

export default ShareControl;
