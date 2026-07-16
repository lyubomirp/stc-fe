"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNav from "@/app/components/TopNav";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import { accentFade, factionColor } from "@/app/data/factionColors";
import { API } from "@/app/data/api";
import type { Faction } from "@/app/store/factionStore";

export interface SavedRoster {
  id: string;
  name: string;
  factionId: string;
  subfactionKeyword: string | null;
  detachmentName: string | null;
  battleSize: number;
  pointsAtSave: number | null;
  updatedAt: string;
  units: { id: string }[];
}

const SCALE: Record<number, string> = {
  1000: "Incursion",
  2000: "Strike Force",
  3000: "Onslaught",
};

const RosterList: React.FC<{
  rosters: SavedRoster[];
  factions: Faction[];
}> = ({ rosters, factions }) => {
  const router = useRouter();
  const [list, setList] = useState(rosters);
  const [busy, setBusy] = useState<string | null>(null);

  const nameOf = (id: string) => factions.find((f) => f.id === id)?.name ?? id;

  const remove = async (id: string) => {
    setBusy(id);

    try {
      const res = await fetch(`${API}/rosters/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(String(res.status));
      setList((l) => l.filter((r) => r.id !== id));
      router.refresh();
    } catch {
      setBusy(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080a] text-white/90">
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="border-b border-white/[0.07]">
          <TopNav />
        </div>

        <header className="px-8 pb-8 pt-6">
          <span className="flex items-center gap-2 text-hud text-white/40">
            <span className="h-1.5 w-1.5 rounded-full border border-white/40" />
            {list.length} {list.length === 1 ? "ARMY" : "ARMIES"} ON RECORD
          </span>
          <h1 className="mt-3 font-amsterdam text-6xl italic text-white">
            Army Lists
          </h1>
        </header>

        <main className="px-8 pb-16">
          {!list.length && (
            <div className="border border-dashed border-white/15 p-16 text-center">
              <p className="mb-5 font-mono text-xs tracking-[0.1em] text-white/40">
                NO ARMIES SAVED YET
              </p>
              <Link
                href="/army-builder"
                className="inline-block border border-white/25 px-6 py-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5"
              >
                Build One
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-px bg-white/10">
            {list.map((r) => {
              // Each row carries its own faction's accent, the same contract as
              // a FactionCard: the colour is the fastest way to tell them apart.
              const accent = {
                "--accent": factionColor(r.factionId),
              } as React.CSSProperties;
              const over = (r.pointsAtSave ?? 0) > r.battleSize;

              return (
                <div
                  key={r.id}
                  style={accent}
                  className="group flex items-center gap-5 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.05]"
                >
                  <span
                    className="h-10 w-10 shrink-0 text-[color:var(--accent)]"
                    style={{ filter: `drop-shadow(0 0 8px ${accentFade(50)})` }}
                  >
                    <FactionSvgResolver
                      factionId={r.factionId}
                      className="h-full w-full fill-current"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-amsterdam text-card font-bold uppercase text-white">
                      {r.name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.1em] text-white/45">
                      <span className="text-[color:var(--accent)]">
                        {nameOf(r.factionId).toUpperCase()}
                      </span>
                      {r.subfactionKeyword && (
                        <span>{r.subfactionKeyword.toUpperCase()}</span>
                      )}
                      {r.detachmentName && <span>{r.detachmentName}</span>}
                      <span>
                        {r.units.length}{" "}
                        {r.units.length === 1 ? "UNIT" : "UNITS"}
                      </span>
                      <span>
                        {new Date(r.updatedAt).toLocaleDateString()}{" "}
                        {new Date(r.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[9px] tracking-[0.1em] text-white/40">
                      {SCALE[r.battleSize] ?? `${r.battleSize} PTS`}
                    </div>
                    <div
                      className="font-amsterdam text-2xl font-bold leading-none"
                      style={{ color: over ? "#ff6b6b" : "#fff" }}
                    >
                      {r.pointsAtSave ?? "—"}
                      <span className="text-sm text-white/45">
                        {" "}
                        / {r.battleSize}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/army-builder?roster=${r.id}`}
                    className="shrink-0 border border-[color:var(--accent)] px-5 py-2.5 font-amsterdam text-sm font-bold uppercase tracking-[0.1em] text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)] hover:text-black"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={busy === r.id}
                    aria-label={`Delete ${r.name}`}
                    className="shrink-0 border border-white/15 px-3 py-2.5 font-mono text-[10px] tracking-[0.1em] text-white/40 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:opacity-40"
                  >
                    {busy === r.id ? "…" : "DELETE"}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RosterList;
