"use client";
import React, { useEffect, useState } from "react";
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
  const { user, known, clear } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // A drawer that survived the navigation it triggered would cover the page it
  // just opened.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);

    // Without this the page behind scrolls under the drawer, which on a phone
    // reads as the drawer itself being broken.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const signOut = async () => {
    setSigningOut(true);

    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      // Before navigating: replace('/') from '/' does not change the pathname,
      // so the provider's re-check never fires and the nav would keep showing
      // a signed-in state.
      clear();

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
    <>
      <nav className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-4">
          <span className="font-amsterdam text-lg font-bold tracking-widest text-white">
            STC
          </span>
          {/* Wraps to two lines under ~640px, which reads as a layout bug rather
            than as the flavour text it is. */}
          <span className="hidden items-center gap-2 text-hud text-white/40 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            LIVE LINK ESTABLISHED
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
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
        <div className="hidden w-44 items-center justify-end gap-4 md:flex">
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

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="p-1 text-white/60 transition-colors hover:text-white md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </nav>

      {/* Always mounted, toggled by transform: animating a conditionally
          rendered panel gets the open transition and never the close one. */}
      <div
        className={
          "fixed inset-0 z-50 md:hidden " +
          (menuOpen ? "" : "pointer-events-none")
        }
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={
            "absolute inset-0 bg-black/70 transition-opacity duration-200 " +
            (menuOpen ? "opacity-100" : "opacity-0")
          }
        />

        <div
          className={
            "absolute right-0 top-0 flex h-full w-64 flex-col border-l " +
            "border-white/10 bg-black transition-transform duration-300 " +
            "ease-out motion-reduce:transition-none " +
            (menuOpen ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-mono text-[11px] tracking-[0.1em] text-white/35">
              MENU
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-2xl leading-none text-white/50 transition-colors hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col px-5 py-4">
            {tabs.map(({ label, href }) =>
              !href ? (
                <span key={label} className="py-3 text-sm text-white/25">
                  {label}
                </span>
              ) : href === pathname ? (
                <span
                  key={label}
                  className={
                    "py-3 text-sm " +
                    (accented
                      ? "text-[color:var(--accent)]"
                      : "text-fuchsia-400")
                  }
                >
                  {label}
                </span>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="py-3 text-sm text-white/60 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              ),
            )}
          </div>

          {user && (
            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-5 py-4">
              <span
                className="truncate font-mono text-[10px] text-white/25"
                title={user.email}
              >
                {user.email}
              </span>

              {user.isAdmin &&
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

              <button
                type="button"
                onClick={() => void signOut()}
                disabled={signingOut}
                className="text-left font-mono text-[11px] tracking-[0.1em] text-white/40 transition-colors hover:text-red-400 disabled:opacity-40"
              >
                {signingOut ? "…" : "SIGN OUT"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopNav;
