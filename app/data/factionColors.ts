import { CHAPTER_COLORS, FACTION_COLORS } from "@/tailwind.config";

export const FALLBACK_ACCENT = "#a3a3a3";

const factionKey = (factionId: string): keyof typeof FACTION_COLORS =>
  factionId?.toLowerCase() as keyof typeof FACTION_COLORS;

export const factionColor = (factionId: string): string =>
  FACTION_COLORS[factionKey(factionId)] ?? FALLBACK_ACCENT;

const chapterKey = (subfaction: string): keyof typeof CHAPTER_COLORS =>
  subfaction.toLowerCase().replace(/\s+/g, "-") as keyof typeof CHAPTER_COLORS;

// Faction accent, refined to the chapter colour when a sub-faction has one.
export const accentColor = (
  factionId: string,
  subfaction?: string | null,
): string =>
  (subfaction && CHAPTER_COLORS[chapterKey(subfaction)]) ||
  factionColor(factionId);

export const accentFade = (pct: number): string =>
  `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

export const accentLighten = (pct: number): string =>
  `color-mix(in srgb, var(--accent) ${pct}%, white)`;

// Every accent is light, so text over an accent fill is near-black.
export const ON_ACCENT = "#06070a";
