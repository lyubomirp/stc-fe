// Faction accents. Read at runtime to set --accent: Tailwind builds classes
// from literal strings, so it cannot generate these per faction.
export const FACTION_COLORS: Record<string, string> = {
  // Traitor legions
  ec: "#e879f9",
  we: "#ef4444",
  dg: "#84cc16",
  ts: "#22d3ee",

  // Chaos
  csm: "#c084fc",
  cd: "#fb7185",
  qt: "#f87171",

  // Imperium
  sm: "#60a5fa",
  am: "#34d399",
  as: "#fb923c",
  ac: "#fbbf24",
  adm: "#f87171",
  gk: "#7dd3fc",
  aoi: "#cbd5e1",
  qi: "#a5b4fc",
  tl: "#a1a1aa",

  // Xenos
  ae: "#a78bfa",
  dru: "#a855f7",
  nec: "#4ade80",
  ork: "#facc15",
  tau: "#5eead4",
  tyr: "#c084fc",
  gc: "#818cf8",
  lov: "#f59e0b",

  // Unaligned
  un: "#a3a3a3",
};

export const FALLBACK_ACCENT = "#a3a3a3";

export const factionColor = (factionId: string): string =>
  FACTION_COLORS[factionId?.toLowerCase()] ?? FALLBACK_ACCENT;

// The design hardcodes ~20 rgba() variants of its one blue. These derive the
// same variants from whatever --accent currently is. color-mix is already how
// globals.css fades the accent, so this is the established route.
export const accentFade = (pct: number): string =>
  `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

export const accentLighten = (pct: number): string =>
  `color-mix(in srgb, var(--accent) ${pct}%, white)`;

/** Text laid over an accent fill. Every accent is light, so this is near-black. */
export const ON_ACCENT = "#06070a";
