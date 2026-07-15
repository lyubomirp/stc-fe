// Authored here: the export ships tooltip anchors but not their bodies.
// Text is 11th edition; the imported data is 10th.

export interface Rule {
  name: string;
  text: string;
  /** Behaviour differs from 10th edition; the imported data is 10th. */
  edition11?: true;
}

export const RULES: Record<string, Rule> = {
  anti: {
    name: "Anti-X Y+",
    text: "Scores a Critical Wound on a to-wound roll of Y or better against the named target type, regardless of Toughness.",
  },
  assault: {
    name: "Assault",
    text: "Can be shot even if the unit Advanced this turn.",
  },
  blast: {
    name: "Blast",
    text: "+1 attack for every five models in the target unit. Blast D6 fires D6+2 against a unit of 10–14.",
  },
  cleave: {
    name: "Cleave",
    text: "Blast, but in melee: +1 attack for every five models in the target unit.",
    edition11: true,
  },
  conversion: {
    name: "Conversion",
    text: "Against a target at least half the weapon's range away, scores Critical Hits on 4+.",
  },
  "devastating wounds": {
    name: "Devastating Wounds",
    text: "On a Critical Wound (normally a 6 to wound), the target gets no save — armour or invulnerable.",
  },
  "extra attacks": {
    name: "Extra Attacks",
    text: "Attacks with this in addition to the chosen melee weapon. Its attack count cannot be modified.",
  },
  hazardous: {
    name: "Hazardous",
    text: "Roll a D6 per Hazardous weapon used. On a 1–2 the bearer's unit suffers 1 mortal wound — 3 for Vehicles.",
    edition11: true,
  },
  heavy: {
    name: "Heavy",
    text: '+1 to hit if the unit is unengaged, was not set up this turn, and moved 3" or less.',
    edition11: true,
  },
  "indirect fire": {
    name: "Indirect Fire",
    text: "Out of line of sight: hits only on an unmodified 6, no re-rolls. If another model in the army can see the target, 4+.",
    edition11: true,
  },
  "ignores cover": {
    name: "Ignores Cover",
    text: "Ignores the Benefit of Cover, which is a −1 to hit penalty.",
    edition11: true,
  },
  lance: {
    name: "Lance",
    text: "+1 to wound on a turn the unit Charged.",
  },
  "lethal hits": {
    name: "Lethal Hits",
    text: "A Critical Hit (normally a 6 to hit) wounds automatically — no roll to wound.",
  },
  melta: {
    name: "Melta X",
    text: "+X damage against targets within half range.",
  },
  pistol: {
    name: "Pistol",
    text: "Can fire while in engagement range, but only at a unit it is engaged with. Firing one otherwise bars all other ranged weapons that turn.",
  },
  precision: {
    name: "Precision",
    text: "Attacks against a unit with an attached Character can be directed at the Character rather than its bodyguard.",
    edition11: true,
  },
  psychic: {
    name: "Psychic",
    text: "Ignores modifiers to Hit rolls. Some abilities react specifically to Psychic attacks.",
    edition11: true,
  },
  "rapid fire": {
    name: "Rapid Fire X",
    text: "+X shots against targets within half range.",
  },
  "sustained hits": {
    name: "Sustained Hits X",
    text: "+X extra hits on each Critical Hit (normally a 6). With Lethal Hits, the crit auto-wounds and the extra hit rolls to wound.",
  },
  "one shot": {
    name: "One Shot",
    text: "Can only be fired once per battle.",
  },
  torrent: {
    name: "Torrent",
    text: "Hits automatically.",
  },
  "twin-linked": {
    name: "Twin-Linked",
    text: "Re-roll the To Wound roll.",
  },

  // Unit abilities
  "deep strike": {
    name: "Deep Strike",
    text: 'Starts in Reserves. Arrives at the end of a Movement phase, more than 9" from enemy units. Missions often forbid this on Battle Round 1.',
  },
  "deadly demise": {
    name: "Deadly Demise X",
    text: "On losing its last wound, roll a D6. On a 6 it deals X mortal wounds to every unit within range of the explosion.",
  },
  "fights first": {
    name: "Fights First",
    text: "Attacks in the Fights First step, before Remaining Combats. The active player picks the first unit to fight, then players alternate.",
    edition11: true,
  },
  "firing deck": {
    name: "Firing Deck X",
    text: "The vehicle may shoot using up to X weapons carried by embarked models. The vehicle makes the attacks, so its own buffs apply.",
  },
  infiltrators: {
    name: "Infiltrators",
    text: 'Deploys anywhere on the battlefield more than 9" from enemy units.',
  },
  leader: {
    name: "Leader",
    text: "A Character that joins a squad at deployment. The squad becomes its bodyguard, absorbing attacks until destroyed.",
  },
  "lone operative": {
    name: "Lone Operative",
    text: 'While unattached, is not visible to enemies more than 12" away and cannot be targeted by Indirect Fire from beyond 12".',
    edition11: true,
  },
  scouts: {
    name: 'Scouts X"',
    text: 'Makes a free X" move after deployment.',
  },
  stealth: {
    name: "Stealth",
    text: "If every model has it, the unit gains the Benefit of Cover against ranged attacks (−1 to hit). Does not stack with cover.",
    edition11: true,
  },
  "hit roll": {
    name: "Hit Roll",
    text: "One D6 per attack. Meets or beats the weapon's BS (ranged) or WS (melee) and it hits; otherwise the attack ends.",
  },
  "wound roll": {
    name: "Wound Roll",
    text: "One D6 per hit. The number needed comes from the attack's Strength against the target's Toughness.",
  },
};

// Longest first so "sustained hits" wins over a shorter key that prefixes it.
const KEYS = Object.keys(RULES).sort((a, b) => b.length - a.length);

// Reduces "[SUSTAINED HITS 1]", "Rapid Fire weapons" or "anti-vehicle 4+" to a key.
export const lookupRule = (raw: string): Rule | undefined => {
  const text = raw
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return undefined;

  // anti-vehicle 4+ -> anti
  if (text.startsWith("anti-") || text.startsWith("anti ")) {
    return RULES.anti;
  }

  const key = KEYS.find((k) => text === k || text.startsWith(`${k} `));

  return key ? RULES[key] : undefined;
};
