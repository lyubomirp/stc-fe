// Presentation data the API does not carry. Accents live in factionColors.ts,
// shared with tailwind.config. `armyRule` names a real ability from the API --
// several factions have more than one, so the pick is editorial. Legion
// numerals are the true ones (WE=XII, DG=XIV, TS=XV, EC=III).

export interface FactionMeta {
  /** Prefix of the card code: a legion numeral, or a group. */
  code: string;
  /** Ability name used as the card's flavour line. */
  armyRule: string;
}

export const FACTION_META: Record<string, FactionMeta> = {
  // Traitor legions -- real numerals
  EC: { code: "003", armyRule: "Pact of Excess" },
  WE: { code: "012", armyRule: "Pact of Blood" },
  DG: { code: "014", armyRule: "Pact of Decay" },
  TS: { code: "015", armyRule: "Pact of Sorcery" },

  // Chaos
  CSM: { code: "CHA", armyRule: "Dark Pacts" },
  CD: { code: "CHA", armyRule: "The Shadow of Chaos" },
  QT: { code: "CHA", armyRule: "Dark Pacts" },

  // Imperium
  SM: { code: "IMP", armyRule: "Oath of Moment" },
  AM: { code: "IMP", armyRule: "Voice of Command" },
  AS: { code: "IMP", armyRule: "Acts of Faith" },
  AC: { code: "IMP", armyRule: "Martial Ka’tah" },
  AdM: {
    code: "IMP",
    armyRule: "Doctrina Imperatives",
  },
  GK: { code: "IMP", armyRule: "Gate of Infinity" },
  AoI: { code: "IMP", armyRule: "Assigned Agents" },
  QI: { code: "IMP", armyRule: "Code Chivalric" },
  TL: { code: "IMP", armyRule: "Titanic Support" },

  // Xenos
  AE: { code: "XEN", armyRule: "Strands of Fate" },
  DRU: { code: "XEN", armyRule: "Power from Pain" },
  NEC: {
    code: "XEN",
    armyRule: "Reanimation Protocols",
  },
  ORK: { code: "XEN", armyRule: "Waaagh!" },
  TAU: {
    code: "XEN",
    armyRule: "For the Greater Good",
  },
  TYR: {
    code: "XEN",
    armyRule: "Shadow in the Warp",
  },
  GC: { code: "XEN", armyRule: "Cult Ambush" },
  LoV: {
    code: "XEN",
    armyRule: "Prioritised Efficiency",
  },

  // Unaligned
  UN: { code: "UNA", armyRule: "Unaligned Forces" },
};

export const factionCode = (factionId: string): string => {
  const meta = FACTION_META[factionId];
  return `#${meta?.code ?? "???"}-${factionId.toUpperCase()}`;
};
