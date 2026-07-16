"use client";
import React, { useEffect, useMemo, useState } from "react";
import StepHeader from "@/app/components/army/steps/StepHeader";
import { accentFade, ON_ACCENT } from "@/app/data/factionColors";
import { API } from "@/app/data/api";
import type { Faction } from "@/app/store/factionStore";

export interface RosterItem {
  uid: string;
  datasheetId: string;
  name: string;
  role: string | null;
  costs: CostTier[];
  /** Which cost option is selected. Model count cannot identify one. */
  costLine: string | null;
  modelCount: number;
  pts: number | null;
}

interface CostTier {
  /** The datasheets_models_cost line -- the identity of this option. */
  line: string;
  models: number;
  pts: number;
  /** "3 Wolf Guard Headtakers and 3 Hunting Wolves" */
  label: string;
}

interface Unit {
  id: string;
  name: string;
  role: string | null;
  /** Cheapest tier first. Comes down with the list, so no per-unit fetch. */
  costs: CostTier[];
}

const TICKS = 44;

// Legacy only: rosters saved before costLine existed carry a model count, and
// a count is ambiguous -- 14 datasheets price two compositions at the same one.
// Quote the higher, matching the API.
const priceByCount = (
  tiers: CostTier[],
  modelCount: number,
): CostTier | null => {
  if (!tiers.length) return null;
  const fitting = tiers.filter((t) => modelCount >= t.models);
  if (!fitting.length) return tiers[0];
  const best = Math.max(...fitting.map((t) => t.models));
  return fitting
    .filter((t) => t.models === best)
    .reduce((a, b) => (b.pts > a.pts ? b : a));
};

const RosterStep: React.FC<{
  faction: Faction;
  subfaction: string | null;
  detachmentName: string | null;
  cap: number;
  name: string;
  onName: (name: string) => void;
  roster: RosterItem[];
  onRoster: (roster: RosterItem[]) => void;
  /** Saved units awaiting cost tiers, when editing an existing roster. */
  pendingUnits:
    | { datasheetId: string; costLine: string | null; modelCount: number }[]
    | null;
  onHydrated: (roster: RosterItem[]) => void;
  onSave: () => void;
  saving: boolean;
  savedId: string | null;
  dirty: boolean;
  saveError: string | null;
  onContinue: () => void;
}> = ({
  faction,
  subfaction,
  detachmentName,
  cap,
  name,
  onName,
  roster,
  onRoster,
  pendingUnits,
  onHydrated,
  onSave,
  saving,
  savedId,
  dirty,
  saveError,
  onContinue,
}) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [query, setQuery] = useState("");

  // Filtered server-side: the list projection is id/name/role, so the client
  // has no keywords to filter on.
  useEffect(() => {
    let live = true;
    const url = subfaction
      ? `${API}/datasheets/${faction.id}?subfaction=${encodeURIComponent(subfaction)}`
      : `${API}/datasheets/${faction.id}`;

    fetch(url)
      .then((r) => r.json())
      .then((j: Unit[]) => {
        if (live) setUnits([...j].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => live && setUnits([]));

    return () => {
      live = false;
    };
  }, [faction.id, subfaction]);

  // A saved unit stores only its id and model count, so it cannot become a
  // RosterItem until the datasheets list brings the cost tiers with it.
  useEffect(() => {
    if (!pendingUnits || !units.length) return;

    const byId = new Map(units.map((u) => [u.id, u]));

    onHydrated(
      pendingUnits.map((p, i) => {
        const u = byId.get(p.datasheetId);
        const costs = u?.costs ?? [];
        // costLine is exact. Rosters saved before it existed only have a
        // count, which is ambiguous -- re-price them the same way the API does.
        const tier = p.costLine
          ? (costs.find((c) => c.line === p.costLine) ?? null)
          : priceByCount(costs, p.modelCount);

        return {
          uid: `${p.datasheetId}-restored-${i}`,
          datasheetId: p.datasheetId,
          // The datasheet may have been dropped upstream since the save; the
          // roster still lists it rather than losing the row silently.
          name: u?.name ?? "(unknown unit)",
          role: u?.role ?? null,
          costs,
          costLine: tier?.line ?? null,
          modelCount: tier?.models ?? p.modelCount,
          pts: tier?.pts ?? null,
        };
      }),
    );
    // onHydrated clears pendingUnits, so this runs once per load.
  }, [pendingUnits, units]);

  const add = (u: Unit) => {
    const first = u.costs[0] ?? null;

    onRoster([
      ...roster,
      {
        uid: `${u.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        datasheetId: u.id,
        name: u.name,
        role: u.role,
        costs: u.costs,
        costLine: first?.line ?? null,
        modelCount: first?.models ?? 1,
        pts: first?.pts ?? null,
      },
    ]);
  };

  // Picking a *row*, not a count: the row is what carries the price, and two
  // rows can field the same number of models for different points.
  const choose = (uid: string, line: string) =>
    onRoster(
      roster.map((it) => {
        if (it.uid !== uid) return it;
        const tier = it.costs.find((c) => c.line === line);
        if (!tier) return it;
        return {
          ...it,
          costLine: tier.line,
          modelCount: tier.models,
          pts: tier.pts,
        };
      }),
    );

  const total = useMemo(
    () => roster.reduce((sum, r) => sum + (r.pts ?? 0), 0),
    [roster],
  );
  const pct = Math.min(100, Math.round((total / cap) * 100));
  const filled = Math.round((pct / 100) * TICKS);
  const over = total > cap;

  const q = query.trim().toLowerCase();
  const shown = q
    ? units.filter((u) => u.name.toLowerCase().includes(q))
    : units;

  return (
    <>
      <StepHeader
        title="Roster"
        meta={`STEP 2 / 3 · ${shown.length} UNITS AVAILABLE`}
      />

      <div className="mb-6 flex items-center gap-7 border border-white/[0.09] px-6 py-4">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="roster-name"
            className="mb-1 block font-mono text-hud text-white/45"
          >
            ROSTER NAME
          </label>
          {/* The heading is the field: naming the army is the first thing you
              do, and a separate label would just repeat it. */}
          <input
            id="roster-name"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Untitled Roster"
            className="w-full border-b border-white/10 bg-transparent pb-1 font-amsterdam text-3xl font-bold uppercase leading-none text-white outline-none transition-colors placeholder:text-white/25 focus:border-[color:var(--accent)]"
          />
        </div>

        <div className="shrink-0">
          <div className="mb-0.5 font-mono text-hud text-white/45">
            TOTAL VALUE
          </div>
          <div
            className="font-amsterdam text-4xl font-bold leading-none"
            style={{ color: over ? "#ff6b6b" : "#fff" }}
          >
            {total} <span className="text-lg text-white/45">/ {cap} PTS</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex h-3.5 gap-0.5">
          {Array.from({ length: TICKS }, (_, i) => (
            <span
              key={i}
              className="flex-1"
              style={{
                background:
                  i < filled
                    ? over || i > TICKS * 0.9
                      ? "#ff6b6b"
                      : "var(--accent)"
                    : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between font-mono text-[9px] text-white/40">
          <span>0</span>
          <span style={over ? { color: "#ff6b6b" } : undefined}>
            {over ? `${total - cap} PTS OVER` : `${cap - total} PTS REMAINING`}
          </span>
          <span>{cap}</span>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[340px_1fr]">
        <div className="border border-white/[0.08] p-4">
          <div className="mb-1 font-amsterdam text-xl font-bold uppercase text-white">
            Add Units
          </div>
          <div className="mb-3.5 font-mono text-[10px] tracking-[0.1em] text-white/40">
            {subfaction ? subfaction.toUpperCase() : faction.name.toUpperCase()}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search units…"
            className="mb-3.5 w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[color:var(--accent)] focus:outline-none"
          />

          <div className="flex max-h-[460px] flex-col overflow-y-auto">
            {shown.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 border-b border-white/[0.05] px-1 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white/90">
                    {u.name}
                  </div>
                  {u.role && (
                    <div className="mt-0.5 font-mono text-[10px] text-white/45">
                      {u.role}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Add ${u.name}`}
                  onClick={() => add(u)}
                  style={{
                    borderColor: accentFade(40),
                    background: accentFade(10),
                  }}
                  className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border text-base leading-none text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)] hover:text-black"
                >
                  +
                </button>
              </div>
            ))}

            {!shown.length && (
              <div className="py-8 text-center font-mono text-[11px] tracking-[0.1em] text-white/35">
                {units.length ? "NO MATCHES" : "LOADING…"}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 font-mono text-hud text-white/45">
            ACTIVE ROSTER
          </div>
          <div className="mb-5 font-amsterdam text-2xl font-bold uppercase leading-none text-white/90">
            {roster.length} {roster.length === 1 ? "Unit" : "Units"}
            {detachmentName && (
              <span className="ml-3 font-raleway text-sm font-normal normal-case text-white/40">
                {detachmentName}
              </span>
            )}
          </div>

          {!roster.length && (
            <div className="border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-white/45">
              NO UNITS — ADD FROM THE ARSENAL
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {roster.map((it) => (
              <div
                key={it.uid}
                className="flex items-center gap-3.5 border border-white/[0.08] bg-white/[0.014] px-4 py-3 transition-colors hover:border-white/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-amsterdam text-lg font-bold uppercase leading-none text-white">
                    {it.name}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-white/45">
                    {it.role ?? "—"}
                  </div>
                </div>

                {/* 1348 of 1708 datasheets have exactly one priced option --
                    Fulgrim cannot become two Fulgrims. Only render a control
                    where there is genuinely something to choose. */}
                {it.costs.length > 1 ? (
                  <select
                    aria-label={`${it.name} composition`}
                    value={it.costLine ?? ""}
                    onChange={(e) => choose(it.uid, e.target.value)}
                    className="w-[260px] shrink-0 border border-white/15 bg-black px-2 py-1.5 text-xs text-white/80 outline-none transition-colors hover:border-white/30 focus:border-[color:var(--accent)]"
                  >
                    {it.costs.map((c) => (
                      <option key={c.line} value={c.line}>
                        {c.label} — {c.pts} pts
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="w-[260px] shrink-0 truncate font-mono text-[11px] text-white/45">
                    {it.costs[0]?.label ?? `${it.modelCount} models`}
                  </span>
                )}

                <span className="w-20 shrink-0 text-right font-mono text-sm font-bold text-[color:var(--accent)]">
                  {it.pts ?? "—"}{" "}
                  <span className="font-normal text-white/45">PTS</span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onRoster(roster.filter((x) => x.uid !== it.uid))
                  }
                  className="shrink-0 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em] text-white/50 transition-colors hover:border-red-400/40 hover:text-red-400"
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !roster.length}
              style={
                roster.length && !saving
                  ? { background: "var(--accent)", color: ON_ACCENT }
                  : undefined
              }
              className={
                "px-7 py-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] transition-[filter] " +
                (roster.length && !saving
                  ? "hover:brightness-110"
                  : "cursor-not-allowed border border-white/10 text-white/25")
              }
            >
              {saving
                ? "Saving…"
                : savedId && !dirty
                  ? "Saved"
                  : savedId
                    ? "Update Army"
                    : "Save Army"}
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={!roster.length}
              className={
                "px-5 py-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] transition-colors " +
                (roster.length
                  ? "border border-white/25 text-white hover:border-white hover:bg-white/5"
                  : "cursor-not-allowed border border-white/10 text-white/25")
              }
            >
              Edit Loadouts →
            </button>

            {savedId && (
              <span
                className={
                  "font-mono text-[10px] tracking-[0.1em] " +
                  (dirty ? "text-white/40" : "text-[color:var(--accent)]")
                }
              >
                {dirty ? "UNSAVED CHANGES · " : "SAVED · "}
                {savedId.slice(0, 8)}
              </span>
            )}
            {saveError && (
              <span className="font-mono text-[10px] tracking-[0.1em] text-red-400">
                {saveError.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RosterStep;
