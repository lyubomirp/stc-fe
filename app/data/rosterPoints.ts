import type { RosterItem } from "@/app/types/RosterItem";

// The one definition of what an army costs on the client: the rail meter and
// the roster step must never disagree. Mirrors totalPoints in the API's
// RostersService -- wargear is free in 10e, enhancements are not.
export const rosterPoints = (roster: RosterItem[]): number =>
  roster.reduce((sum, r) => sum + (r.pts ?? 0) + (r.enhancementPts ?? 0), 0);
