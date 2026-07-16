"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Datasheets has no route yet: its page is pre-rewrite, so it stays inert
// rather than shipping a link into legacy.
const TABS: { label: string; href?: string }[] = [
  { label: "Factions", href: "/" },
  { label: "Datasheets" },
  { label: "Army Builder", href: "/army-builder" },
  { label: "My Lists", href: "/rosters" },
];

// `accented` opts a screen into its faction's colour. Off by default: the
// faction list has no faction, and --accent there resolves to the white
// :root fallback, which reads as a dead tab rather than an active one.
const TopNav: React.FC<{ accented?: boolean }> = ({ accented }) => {
  const pathname = usePathname();

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
        {TABS.map(({ label, href }) => {
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

      <div className="w-24" />
    </nav>
  );
};

export default TopNav;
