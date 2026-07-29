import type { RosterItem } from "@/app/types/RosterItem";

// The one definition of what an army costs on the client: the rail meter and
// the roster step must never disagree. Mirrors totalPoints in the API's
// RostersService -- wargear is free in 10e, enhancements are not.
export const rosterPoints = (roster: RosterItem[]): number =>
  roster.reduce((sum, r) => sum + (r.pts ?? 0) + (r.enhancementPts ?? 0), 0);

// MUST match the stagger loop in the API's RostersService.build: same copy
// counting, same threshold test, same tier lookup. If one starts surcharging a
// different copy, the builder quotes a total the save disagrees with.
//
// Every price is re-derived from the base tier rather than from the current
// pts, so repeated runs are idempotent -- which they have to be, since this
// runs on every roster mutation.
export const repriceForStagger = (roster: RosterItem[]): RosterItem[] => {
  const copies = new Map<string, number>();

  return roster.map((it) => {
    const base =
      it.costs.find((c) => c.line === it.costLine)?.pts ?? it.pts ?? null;

    // Position among identical datasheets, 1-based, in roster order.
    const ordinal = (copies.get(it.datasheetId) ?? 0) + 1;
    copies.set(it.datasheetId, ordinal);

    // Allies are priced from their own faction's ally costs and never trigger
    // the primary faction's stagger -- the API skips them the same way.
    const surcharge =
      !it.allyFamily && it.staggerFrom && ordinal >= it.staggerFrom
        ? (it.stagger?.find((t) => t.models === it.modelCount) ?? null)
        : null;

    const pts = surcharge?.pts ?? base;

    if (pts === it.pts && !!surcharge === it.surcharged) return it;
    return { ...it, pts, surcharged: !!surcharge };
  });
};
