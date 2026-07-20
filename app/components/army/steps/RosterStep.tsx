"use client";
import React, { useEffect, useMemo, useState } from "react";
import StepHeader from "@/app/components/army/steps/StepHeader";
import LoadoutModal from "@/app/components/army/LoadoutModal";
import DatasheetModal from "@/app/components/datasheets/DatasheetModal";
import { accentFade, ON_ACCENT } from "@/app/data/factionColors";
import { rosterPoints } from "@/app/data/rosterPoints";
import { API } from "@/app/data/api";
import type { Faction } from "@/app/store/factionStore";
import type { AttachTarget } from "@/app/types/AttachTarget";
import type { AlliedFamily, AlliedUnit } from "@/app/types/AlliedFamily";
import type { CostTier } from "@/app/types/CostTier";
import type { DatasheetListItem } from "@/app/types/DatasheetListItem";
import type { Enhancement } from "@/app/types/Enhancement";
import type { PendingUnit } from "@/app/types/PendingUnit";
import type { RosterItem } from "@/app/types/RosterItem";
import type { WargearPick } from "@/app/types/WargearPick";
import type { DatasheetHit } from "@/app/types/DatasheetHit";

const TICKS = 44;

interface CapRow {
  label: string;
  used: number;
  cap: number;
}

// Legacy rosters carry only a model count, which is ambiguous. Must keep
// quoting the higher tier, matching priceAt in the API's utils/costs.
// The defined allied-cap battle sizes are 1000/2000/3000; pick the one closest
// to an arbitrary points cap so Combat Patrol and custom games still get a cap.
const nearestBracket = (
  pts: number,
  byBattleSize: Record<number, unknown>,
): number => {
  const keys = Object.keys(byBattleSize).map(Number);
  if (!keys.length) return pts;
  return keys.reduce((best, k) =>
    Math.abs(k - pts) < Math.abs(best - pts) ? k : best,
  );
};

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
  detachmentId: string | null;
  pendingUnits: PendingUnit[] | null;
  onHydrated: (roster: RosterItem[]) => void;
  onSave: () => void;
  saving: boolean;
  savedId: string | null;
  dirty: boolean;
  saveError: string | null;
}> = ({
  faction,
  subfaction,
  detachmentName,
  detachmentId,
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
}) => {
  const [units, setUnits] = useState<DatasheetListItem[]>([]);
  const [families, setFamilies] = useState<AlliedFamily[] | null>(null);
  const [query, setQuery] = useState("");
  const [loadoutFor, setLoadoutFor] = useState<string | null>(null);
  const [infoHit, setInfoHit] = useState<DatasheetHit | null>(null);

  // The datasheet a roster row points at, coloured by its real faction (an
  // ally keeps its own accent, not the primary faction's).
  const infoForRoster = (it: RosterItem): DatasheetHit => {
    const fam = it.allyFamily
      ? (families ?? []).find((f) => f.id === it.allyFamily)
      : null;

    return {
      id: it.datasheetId,
      name: it.name,
      role: it.role,
      factionId: fam?.sourceFactionId ?? faction.id,
      factionName: fam?.name ?? faction.name,
    };
  };

  useEffect(() => {
    let live = true;
    const url = subfaction
      ? `${API}/datasheets/${faction.id}?subfaction=${encodeURIComponent(subfaction)}`
      : `${API}/datasheets/${faction.id}`;

    fetch(url)
      .then((r) => r.json())
      .then((j: DatasheetListItem[]) => {
        if (live) setUnits([...j].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => live && setUnits([]));

    // Allied families do not depend on the sub-faction; keyed on faction only.
    return () => {
      live = false;
    };
  }, [faction.id, subfaction]);

  useEffect(() => {
    let live = true;

    fetch(`${API}/allies/${faction.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: AlliedFamily[]) => live && setFamilies(j))
      .catch(() => live && setFamilies([]));

    return () => {
      live = false;
    };
  }, [faction.id]);

  // Every allied unit across all families, keyed by datasheet id, so a saved
  // roster's agents rehydrate and cap usage can be attributed.
  const alliesById = useMemo(() => {
    const map = new Map<string, { familyId: string; unit: AlliedUnit }>();
    for (const f of families ?? []) {
      for (const u of f.units) map.set(u.id, { familyId: f.id, unit: u });
    }
    return map;
  }, [families]);

  useEffect(() => {
    // Wait for both pools: agents live in `families`, not the datasheets list.
    if (!pendingUnits || !units.length || families == null) return;

    const byId = new Map(units.map((u) => [u.id, u]));

    const items: RosterItem[] = pendingUnits.map((p, i) => {
      const ally = alliesById.get(p.datasheetId);
      const u = byId.get(p.datasheetId);
      const costs = ally?.unit.costs ?? u?.costs ?? [];
      const tier = p.costLine
        ? (costs.find((c) => c.line === p.costLine) ?? null)
        : priceByCount(costs, p.modelCount);

      return {
        uid: `${p.datasheetId}-restored-${i}`,
        datasheetId: p.datasheetId,
        name: ally?.unit.name ?? u?.name ?? "(unknown unit)",
        role: ally?.unit.role ?? u?.role ?? null,
        costs,
        costLine: tier?.line ?? null,
        modelCount: tier?.models ?? p.modelCount,
        pts: tier?.pts ?? null,
        hasWargearChoices: u?.hasWargearChoices ?? false,
        isLeader: u?.isLeader ?? false,
        hasEnhancements: u?.hasEnhancements ?? false,
        wargear: p.wargear ?? [],
        attachedToUid: null,
        enhancementId: p.enhancementId,
        enhancementName: p.enhancementName,
        enhancementPts: p.enhancementPts,
        allyFamily: ally?.familyId ?? null,
        allyCategory: ally?.unit.category ?? null,
      };
    });

    // Second pass: the saved attachment is a row id, so it can only be mapped
    // once every uid exists. The API returns units in no guaranteed order, so
    // this must key on the id and never on position.
    const uidByRowId = new Map(
      pendingUnits.map((p, i) => [p.id, items[i].uid]),
    );

    items.forEach((item, i) => {
      const rowId = pendingUnits[i].attachedToId;
      item.attachedToUid = rowId ? (uidByRowId.get(rowId) ?? null) : null;
    });

    onHydrated(items);
    // onHydrated clears pendingUnits, so this runs once per load.
  }, [pendingUnits, units, families]);

  const newUid = (id: string) =>
    `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const add = (u: DatasheetListItem) => {
    const first = u.costs[0] ?? null;

    onRoster([
      ...roster,
      {
        uid: newUid(u.id),
        datasheetId: u.id,
        name: u.name,
        role: u.role,
        costs: u.costs,
        costLine: first?.line ?? null,
        modelCount: first?.models ?? 1,
        pts: first?.pts ?? null,
        hasWargearChoices: u.hasWargearChoices ?? false,
        isLeader: u.isLeader ?? false,
        hasEnhancements: u.hasEnhancements ?? false,
        wargear: [],
        attachedToUid: null,
        enhancementId: null,
        enhancementName: null,
        enhancementPts: null,
        allyFamily: null,
        allyCategory: null,
      },
    ]);
  };

  // An allied unit: priced from its ally costs, tagged with family and category.
  // No wargear/leader/enhancement surface in this first cut.
  const addAlly = (u: AlliedUnit, familyId: string) => {
    const first = u.costs[0] ?? null;

    onRoster([
      ...roster,
      {
        uid: newUid(u.id),
        datasheetId: u.id,
        name: u.name,
        role: u.role,
        costs: u.costs,
        costLine: first?.line ?? null,
        modelCount: first?.models ?? 1,
        pts: first?.pts ?? null,
        hasWargearChoices: false,
        isLeader: false,
        hasEnhancements: false,
        wargear: [],
        attachedToUid: null,
        enhancementId: null,
        enhancementName: null,
        enhancementPts: null,
        allyFamily: familyId,
        allyCategory: u.category,
      },
    ]);
  };

  const setLoadout = (
    uid: string,
    next: {
      picks: WargearPick[];
      attachedToUid: string | null;
      enhancement: Enhancement | null;
    },
  ) =>
    onRoster(
      roster.map((it) =>
        it.uid === uid
          ? {
              ...it,
              wargear: next.picks,
              attachedToUid: next.attachedToUid,
              enhancementId: next.enhancement?.id ?? null,
              enhancementName: next.enhancement?.name ?? null,
              enhancementPts: next.enhancement?.pts ?? null,
            }
          : it,
      ),
    );

  // Dropping a unit must not leave a leader pointing at it.
  const remove = (uid: string) =>
    onRoster(
      roster
        .filter((x) => x.uid !== uid)
        .map((x) =>
          x.attachedToUid === uid ? { ...x, attachedToUid: null } : x,
        ),
    );

  // Steps the cost-line index, NOT the model count: two options can share a
  // count (Wolf Guard Headtakers is 110 or 170 at 6 models), so a model-count
  // axis cannot address them. costLine stays the identity.
  const stepTier = (uid: string, delta: number) =>
    onRoster(
      roster.map((it) => {
        if (it.uid !== uid) return it;
        const i = it.costs.findIndex((c) => c.line === it.costLine);
        const tier = it.costs[(i < 0 ? 0 : i) + delta];
        if (!tier) return it;
        return {
          ...it,
          costLine: tier.line,
          modelCount: tier.models,
          pts: tier.pts,
        };
      }),
    );

  const total = useMemo(() => rosterPoints(roster), [roster]);
  const pct = Math.min(100, Math.round((total / cap) * 100));
  const filled = Math.round((pct / 100) * TICKS);
  const over = total > cap;

  const q = query.trim().toLowerCase();
  const shown = q
    ? units.filter((u) => u.name.toLowerCase().includes(q))
    : units;

  const shownAllies = useMemo(
    () =>
      (families ?? [])
        .map((f) => ({
          family: f,
          units: q
            ? f.units.filter((u) => u.name.toLowerCase().includes(q))
            : f.units,
        }))
        .filter((f) => f.units.length),
    [families, q],
  );

  // Each family's usage against its cap for this battle size, shown not
  // enforced. Count mode is per-category unit counts (Agents); points mode is
  // a combined points budget (Daemonic Pact).
  const capUsage = useMemo(() => {
    const out: { name: string; rows: CapRow[] }[] = [];

    for (const f of families ?? []) {
      const mine = roster.filter((r) => r.allyFamily === f.id);
      if (!mine.length) continue;

      const caps = f.caps;
      // Rules define allied caps only at 1000/2000/3000; map any other size
      // (Combat Patrol 500, custom) to the nearest defined bracket.
      const bracket = nearestBracket(cap, caps.byBattleSize);
      const rows: CapRow[] =
        caps.mode === "count"
          ? f.categories.map((label) => ({
              label,
              used: mine.filter((r) => r.allyCategory === label).length,
              cap: caps.byBattleSize[bracket]?.[label] ?? 0,
            }))
          : [
              {
                label: "PTS",
                used: mine.reduce((sum, r) => sum + (r.pts ?? 0), 0),
                cap: caps.byBattleSize[bracket] ?? 0,
              },
            ];

      out.push({ name: f.name, rows });
    }

    return out;
  }, [families, roster, cap]);

  return (
    <>
      <StepHeader
        title="Roster"
        meta={`STEP 2 / 2 · ${shown.length} UNITS AVAILABLE`}
      />

      <div className="mb-6 flex items-center gap-7 border border-white/[0.09] px-6 py-4">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="roster-name"
            className="mb-1 block font-mono text-hud text-white/45"
          >
            ROSTER NAME
          </label>
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
                  <button
                    type="button"
                    onClick={() =>
                      setInfoHit({
                        id: u.id,
                        name: u.name,
                        role: u.role,
                        factionId: faction.id,
                        factionName: faction.name,
                      })
                    }
                    title="View datasheet"
                    className="block max-w-full truncate text-left text-sm font-semibold text-white/90 transition-colors hover:text-[color:var(--accent)]"
                  >
                    {u.name}
                  </button>
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

            {shownAllies.map(({ family, units: agentUnits }) => (
              <div key={family.id} className="mt-4">
                <div className="mb-1 border-t border-white/[0.08] pt-3 font-mono text-hud text-[color:var(--accent)]">
                  ALLIED · {family.name.toUpperCase()}
                </div>
                {agentUnits.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 border-b border-white/[0.05] px-1 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() =>
                          setInfoHit({
                            id: u.id,
                            name: u.name,
                            role: u.role,
                            factionId: family.sourceFactionId,
                            factionName: family.name,
                          })
                        }
                        title="View datasheet"
                        className="block max-w-full truncate text-left text-sm font-semibold text-white/90 transition-colors hover:text-[color:var(--accent)]"
                      >
                        {u.name}
                      </button>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-white/45">
                        {u.category && <span>{u.category.toUpperCase()}</span>}
                        <span className="text-[color:var(--accent)]">
                          {u.costs[0]?.pts ?? "—"} PTS
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Add ${u.name}`}
                      onClick={() => addAlly(u, family.id)}
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
              </div>
            ))}
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

          {capUsage.map((f) => (
            <div
              key={f.name}
              className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 border border-white/[0.08] px-4 py-2.5"
            >
              <span className="font-mono text-hud text-[color:var(--accent)]">
                {f.name.toUpperCase()}
              </span>
              {f.rows.map((r) => {
                const over = r.used > r.cap;
                // "PTS" is the points-budget row; show it as "used / cap PTS".
                const isPts = r.label === "PTS";
                return (
                  <span
                    key={r.label}
                    className="font-mono text-[10px] tracking-[0.1em]"
                    style={{
                      color: over ? "#ff6b6b" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {isPts
                      ? `${r.used} / ${r.cap} PTS`
                      : `${r.label.toUpperCase()} ${r.used}/${r.cap}`}
                  </span>
                );
              })}
            </div>
          ))}

          {!roster.length && (
            <div className="border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-white/45">
              NO UNITS — ADD FROM THE ARSENAL
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {roster.map((it) => {
              const i = it.costs.findIndex((c) => c.line === it.costLine);
              const set =
                it.wargear.length +
                (it.attachedToUid ? 1 : 0) +
                (it.enhancementId ? 1 : 0);
              const leads = it.attachedToUid
                ? roster.find((x) => x.uid === it.attachedToUid)
                : null;

              return (
                <div
                  key={it.uid}
                  className="flex items-center gap-3.5 border border-white/[0.08] bg-white/[0.014] px-4 py-3 transition-colors hover:border-white/20"
                >
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setInfoHit(infoForRoster(it))}
                      title="View datasheet"
                      className="block max-w-full truncate text-left font-amsterdam text-lg font-bold uppercase leading-none text-white transition-colors hover:text-[color:var(--accent)]"
                    >
                      {it.name}
                    </button>
                    <div className="mt-1 font-mono text-[10px] text-white/45">
                      {it.allyFamily && (
                        <span className="text-[color:var(--accent)]">
                          ALLY
                          {it.allyCategory
                            ? ` · ${it.allyCategory.toUpperCase()}`
                            : ""}
                          {" · "}
                        </span>
                      )}
                      {it.role ?? "—"}
                      {it.enhancementName && (
                        <span className="text-[color:var(--accent)]">
                          {" · "}
                          {it.enhancementName.toUpperCase()}
                          {" +"}
                          {it.enhancementPts}
                        </span>
                      )}
                      {leads && (
                        <span className="text-[color:var(--accent)]">
                          {" · LEADING "}
                          {leads.name.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {it.costs.length > 1 ? (
                    <div className="flex w-[260px] shrink-0 items-center justify-center gap-2">
                      <button
                        type="button"
                        aria-label={`Smaller ${it.name}`}
                        onClick={() => stepTier(it.uid, -1)}
                        disabled={i <= 0}
                        style={
                          i > 0
                            ? {
                                borderColor: accentFade(40),
                                background: accentFade(10),
                              }
                            : undefined
                        }
                        className={
                          "inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border text-base leading-none transition-colors " +
                          (i > 0
                            ? "text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-black"
                            : "cursor-not-allowed border-white/10 text-white/20")
                        }
                      >
                        −
                      </button>

                      {/* Fixed width, not flex-1: filling the 260px slot threw
                          the − and + ~230px apart and they stopped reading as
                          one control. 8 labels game-wide overflow this, all
                          Space Marines compound squads -- hence the title. */}
                      <span
                        title={it.costs[i]?.label ?? undefined}
                        className="w-[168px] truncate text-center font-mono text-[11px] text-white/70"
                      >
                        {it.costs[i]?.label ?? "—"}
                      </span>

                      <button
                        type="button"
                        aria-label={`Larger ${it.name}`}
                        onClick={() => stepTier(it.uid, 1)}
                        disabled={i >= it.costs.length - 1}
                        style={
                          i < it.costs.length - 1
                            ? {
                                borderColor: accentFade(40),
                                background: accentFade(10),
                              }
                            : undefined
                        }
                        className={
                          "inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border text-base leading-none transition-colors " +
                          (i < it.costs.length - 1
                            ? "text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-black"
                            : "cursor-not-allowed border-white/10 text-white/20")
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="w-[260px] shrink-0 truncate text-center font-mono text-[11px] text-white/45">
                      {it.costs[0]?.label ?? `${it.modelCount} models`}
                    </span>
                  )}

                  <span className="w-20 shrink-0 text-right font-mono text-sm font-bold text-[color:var(--accent)]">
                    {it.pts == null ? "—" : it.pts + (it.enhancementPts ?? 0)}{" "}
                    <span className="font-normal text-white/45">PTS</span>
                  </span>

                  {/* Only EC carries a wargear map today, so most units have
                      nothing to open -- a dead button would be a lie. The slot
                      is reserved regardless: an absent button dragged every
                      column left of it out of line with its neighbours. */}
                  <div className="flex w-[104px] shrink-0 justify-end">
                    {(it.hasWargearChoices ||
                      it.isLeader ||
                      it.hasEnhancements) && (
                      <button
                        type="button"
                        onClick={() => setLoadoutFor(it.uid)}
                        style={
                          set ? { borderColor: accentFade(45) } : undefined
                        }
                        className={
                          "border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em] transition-colors " +
                          (set
                            ? "text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-black"
                            : "border-white/15 text-white/50 hover:border-white/40 hover:text-white")
                        }
                      >
                        LOADOUT{set ? ` · ${set}` : ""}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(it.uid)}
                    className="shrink-0 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em] text-white/50 transition-colors hover:border-red-400/40 hover:text-red-400"
                  >
                    REMOVE
                  </button>
                </div>
              );
            })}
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

      {(() => {
        const it = roster.find((x) => x.uid === loadoutFor);
        if (!it) return null;

        const targets: AttachTarget[] = roster
          .filter((x) => x.uid !== it.uid)
          .map((x) => ({
            uid: x.uid,
            datasheetId: x.datasheetId,
            name: x.name,
            costLabel:
              x.costs.find((c) => c.line === x.costLine)?.label ?? null,
            ledBy: roster.find((c) => c.attachedToUid === x.uid)?.uid ?? null,
          }));

        return (
          <LoadoutModal
            datasheetId={it.datasheetId}
            selfUid={it.uid}
            unitName={it.name}
            costLabel={
              it.costs.find((c) => c.line === it.costLine)?.label ?? null
            }
            picks={it.wargear}
            isLeader={it.isLeader}
            targets={targets}
            attachedToUid={it.attachedToUid}
            hasEnhancements={it.hasEnhancements}
            detachmentId={detachmentId}
            spentEnhancements={roster
              .filter((x) => x.uid !== it.uid && x.enhancementId)
              .map((x) => x.enhancementId!)}
            enhancementId={it.enhancementId}
            onSave={(next) => setLoadout(it.uid, next)}
            onClose={() => setLoadoutFor(null)}
          />
        );
      })()}

      {infoHit && (
        <DatasheetModal hit={infoHit} onClose={() => setInfoHit(null)} />
      )}
    </>
  );
};

export default RosterStep;
