"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/app/components/auth/SessionProvider";
import { apiFetch } from "@/app/data/api";

// `gated` tabs lead somewhere the middleware bounces a signed-out visitor
// straight back off, so showing them is an offer the app will not honour.
const TABS: { label: string; href?: string; gated?: true }[] = [
  { label: "Factions", href: "/" },
  { label: "Datasheets", href: "/datasheets" },
  { label: "Army Builder", href: "/army-builder", gated: true },
  { label: "My Lists", href: "/rosters", gated: true },
];

// Off by default: without a faction, --accent falls back to white.
const TopNav: React.FC<{ accented?: boolean }> = ({ accented }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, known } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);

    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      // Home rather than back: half the app is gated, so staying put would
      // usually mean an immediate bounce to /login. refresh() after, because
      // the gated pages are server-rendered and would otherwise redraw from a
      // cache taken while the session was alive.
      router.replace("/");
      router.refresh();
      setSigningOut(false);
    }
  };

  // Held back until the session is known, so the gated tabs fade IN for a
  // signed-in user rather than being shown and yanked away from a signed-out
  // one. A signed-out visitor -- the case this exists for -- sees the right
  // nav immediately and it never changes.
  const tabs = TABS.filter((t) => !t.gated || (known && user));

  const activeClass = accented
    ? "border-b-2 border-[color:var(--accent)] pb-1 text-sm text-[color:var(--accent)]"
    : "border-b-2 border-fuchsia-400 pb-1 text-sm text-fuchsia-400";

  return (
    <nav className="flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-4">
        <span className="font-amsterdam text-lg font-bold tracking-widest text-white">
          STC
        </span>
        <span className="flex items-center gap-2 text-hud text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          LIVE LINK ESTABLISHED
        </span>
      </div>

      <div className="flex items-center gap-8">
        {tabs.map(({ label, href }) => {
          if (!href) {
            return (
              <span key={label} className="pb-1 text-sm text-white/25">
                {label}
              </span>
            );
          }

          return href === pathname ? (
            <span key={label} className={activeClass}>
              {label}
            </span>
          ) : (
            <Link
              key={label}
              href={href}
              className="pb-1 text-sm text-white/50 transition-colors hover:text-white"
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Fixed width whether or not anything renders inside it. It balances the
          STC/LIVE-LINK block on the left, so letting it collapse for a signed-out
          or non-admin visitor would shift the centre tabs sideways between users
          -- the same reason the roster row reserves its LOADOUT slot. */}
      <div className="flex w-44 items-center justify-end gap-4">
        {user?.isAdmin &&
          (pathname === "/admin" ? (
            <span className="font-mono text-[11px] tracking-[0.1em] text-fuchsia-400">
              ADMIN
            </span>
          ) : (
            <Link
              href="/admin"
              className="font-mono text-[11px] tracking-[0.1em] text-white/40 transition-colors hover:text-white"
            >
              ADMIN
            </Link>
          ))}

        {user && (
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            title={user.email}
            className="font-mono text-[11px] tracking-[0.1em] text-white/40 transition-colors hover:text-red-400 disabled:opacity-40"
          >
            {signingOut ? "…" : "SIGN OUT"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
