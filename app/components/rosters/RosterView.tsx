"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "@/app/components/TopNav";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import DatasheetModal from "@/app/components/datasheets/DatasheetModal";
import ShareControl from "@/app/components/rosters/ShareControl";
import { accentColor, accentFade } from "@/app/data/factionColors";
import type { Faction } from "@/app/store/factionStore";
import type { DatasheetHit } from "@/app/types/DatasheetHit";
import type { RosterDetail } from "@/app/types/RosterDetail";
import type { SavedUnit } from "@/app/types/SavedUnit";

const SCALE: Record<number, string> = {
  500: "Combat Patrol",
  1000: "Incursion",
  2000: "Strike Force",
  3000: "Onslaught",
};

// A leader and the squad it joined render as one block, because that is how the
// unit exists on the table. attachedToId records who DID lead whom (as opposed
// to datasheets_leader, which says who MAY).
interface Block {
  unit: SavedUnit;
  leaders: SavedUnit[];
}

// Deliberately no per-unit points. The army total is the only number that
// matters once the list is built, and with 11e stagger the same datasheet can
// cost different amounts per copy -- printed per row that reads as a mistake.
const RosterView: React.FC<{
  roster: RosterDetail;
  factions: Faction[];
  // Set when viewed through a share link: no nav, no edit, nothing that assumes
  // an account. The body below is identical either way.
  guest?: boolean;
  // Owner-side only, and never passed with `guest`: the API keeps both fields
  // off the shared payload entirely, so there is nothing here to leak.
  shareToken?: string | null;
  shareExpiresAt?: string | null;
}> = ({
  roster,
  factions,
  guest,
  shareToken = null,
  shareExpiresAt = null,
}) => {
  const [hit, setHit] = useState<DatasheetHit | null>(null);

  const factionName =
    factions.find((f) => f.id === roster.factionId)?.name ?? roster.factionId;

  const accent = {
    "--accent": accentColor(roster.factionId, roster.subfactionKeyword),
  } as React.CSSProperties;

  const blocks = useMemo<Block[]>(() => {
    const byId = new Map(roster.units.map((u) => [u.id, u]));
    const leadersOf = new Map<string, SavedUnit[]>();

    for (const u of roster.units) {
      if (!u.attachedToId) continue;
      // An attachment pointing at a unit that is no longer here would otherwise
      // vanish the leader entirely; keep it standalone instead.
      if (!byId.has(u.attachedToId)) continue;
      const list = leadersOf.get(u.attachedToId) ?? [];
      list.push(u);
      leadersOf.set(u.attachedToId, list);
    }

    const attached = new Set(
      roster.units
        .filter((u) => u.attachedToId && byId.has(u.attachedToId))
        .map((u) => u.id),
    );

    return roster.units
      .filter((u) => !attached.has(u.id))
      .map((unit) => ({ unit, leaders: leadersOf.get(unit.id) ?? [] }));
  }, [roster.units]);

  const total = roster.pointsAtSave;
  const modelCount = roster.units.reduce((n, u) => n + (u.modelCount ?? 0), 0);

  const hitFor = (u: SavedUnit): DatasheetHit => ({
    id: u.datasheetId,
    name: u.datasheetName,
    role: null,
    factionId: roster.factionId,
    factionName,
  });

  const unitLine = (u: SavedUnit, isLeader: boolean) => (
    <div
      key={u.id}
      className={isLeader ? "mt-3 border-l-2 pl-3" : ""}
      style={isLeader ? { borderColor: accentFade(45) } : undefined}
    >
      <button
        type="button"
        onClick={() => setHit(hitFor(u))}
        title="View datasheet"
        className="text-left font-amsterdam text-lg font-bold uppercase leading-tight text-white transition-colors hover:text-[color:var(--accent)]"
      >
        {u.datasheetName}
        {/* warlordUnitId points at a roster_units row, not a datasheet: it is
            resolved after insert, so it can only be matched on the row id. */}
        {roster.warlordUnitId === u.id && (
          <span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-[color:var(--accent)]">
            WARLORD
          </span>
        )}
      </button>

      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 font-mono text-[10px] tracking-[0.1em] text-white/40">
        <span>{u.costLabel ?? `${u.modelCount} MODELS`}</span>
        {u.enhancementName && (
          <span className="text-[color:var(--accent)]">
            {u.enhancementName.toUpperCase()}
          </span>
        )}
      </div>

      {/* WargearPick.chosen is the selection name snapshotted at save time, so
          this needs no lookup against the wargear tree. */}
      {u.wargear && u.wargear.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {u.wargear.map((w, i) => (
            <li
              key={`${w.path}-${i}`}
              className="font-mono text-[11px] text-white/55"
            >
              <span className="text-white/30">{w.group}: </span>
              {w.chosen}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div
      style={accent}
      className="relative min-h-screen bg-[#08080a] text-white/90"
    >
      {!guest && (
        <div className="border-b border-white/[0.07]">
          <TopNav accented />
        </div>
      )}

      <header className="px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
        <div className="flex items-start gap-4 sm:gap-5">
          <span
            className="h-11 w-11 shrink-0 text-[color:var(--accent)] sm:h-14 sm:w-14"
            style={{ filter: `drop-shadow(0 0 10px ${accentFade(50)})` }}
          >
            <FactionSvgResolver
              factionId={roster.factionId}
              className="h-full w-full fill-current"
            />
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="font-amsterdam text-4xl italic leading-none text-white sm:text-5xl">
              {roster.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-white/45">
              <span className="text-[color:var(--accent)]">
                {factionName.toUpperCase()}
              </span>
              {roster.subfactionKeyword && (
                <span>{roster.subfactionKeyword.toUpperCase()}</span>
              )}
              {roster.detachmentName && <span>{roster.detachmentName}</span>}
              <span>
                {roster.units.length}{" "}
                {roster.units.length === 1 ? "UNIT" : "UNITS"}
              </span>
              <span>{modelCount} MODELS</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-mono text-[9px] tracking-[0.1em] text-white/40">
              {SCALE[roster.battleSize] ?? `${roster.battleSize} PTS`}
            </div>
            <div className="font-amsterdam text-3xl font-bold leading-none text-white sm:text-4xl">
              {total ?? "—"}
              <span className="text-base text-white/45 sm:text-lg">
                {" "}
                / {roster.battleSize}
              </span>
            </div>
          </div>
        </div>

        {!guest && (
          <>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/army-builder?roster=${roster.id}`}
                className="border border-white/25 px-5 py-2 font-amsterdam text-xs font-bold uppercase tracking-[0.1em] text-white/80 transition-colors hover:border-white hover:text-white"
              >
                Edit list
              </Link>
              <Link
                href="/rosters"
                className="border border-white/10 px-5 py-2 font-amsterdam text-xs font-bold uppercase tracking-[0.1em] text-white/40 transition-colors hover:text-white"
              >
                All lists
              </Link>
            </div>
            <div className="mt-3">
              <ShareControl
                rosterId={roster.id}
                initialToken={shareToken}
                initialExpiresAt={shareExpiresAt}
              />
            </div>
          </>
        )}
      </header>

      <main className="px-4 pb-20 sm:px-8">
        {!roster.units.length ? (
          <div className="border border-dashed border-white/15 p-16 text-center font-mono text-xs tracking-[0.1em] text-white/40">
            THIS LIST HAS NO UNITS
          </div>
        ) : (
          <div className="grid gap-px bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {blocks.map(({ unit, leaders }) => (
              <div key={unit.id} className="bg-[#0b0b0e] p-4">
                {unitLine(unit, false)}
                {leaders.map((l) => unitLine(l, true))}
              </div>
            ))}
          </div>
        )}
      </main>

      {hit && <DatasheetModal hit={hit} onClose={() => setHit(null)} />}
    </div>
  );
};

export default RosterView;
