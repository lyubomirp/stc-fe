import type { Config } from "tailwindcss";

// Faction accents. Read at runtime by factionColors.ts to set --accent:
// Tailwind builds classes from literal strings, so it cannot pick per faction.
export const FACTION_COLORS = {
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

// Space Marine chapter accents — the only sub-factions with distinct colours.
// Read at runtime by factionColors.ts to set --accent; absent chapter = the
// faction accent. Keys are the subfaction keyword kebab-cased.
export const CHAPTER_COLORS = {
  ultramarines: "#4f8ff0",
  "blood-angels": "#f24b5c",
  "dark-angels": "#3fae63",
  "space-wolves": "#93b3cc",
  "black-templars": "#e6e1d1",
  deathwatch: "#c3ccd4",
  "imperial-fists": "#f7c33a",
  "blood-ravens": "#cf5a5f",
  "iron-hands": "#8593a1",
  "raven-guard": "#aab0b7",
  salamanders: "#2ecf82",
  "white-scars": "#dde2e7",
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        faction: FACTION_COLORS,
        chapter: CHAPTER_COLORS,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontSize: {
        hud: ["0.625rem", { letterSpacing: "0.2em" }],
        rule: ["0.75rem", { letterSpacing: "0.15em" }],
        card: ["1.375rem", { lineHeight: "1.15" }],
        "panel-label": ["0.75rem", { letterSpacing: "0.2em" }],
        "panel-body": ["1rem", { lineHeight: "1.65" }],
        "panel-title": ["2rem", { lineHeight: "1.15" }],
        chip: [
          "0.75rem",
          { letterSpacing: "0.08em", fontWeight: "600", lineHeight: "1.4" },
        ],
      },
      fontFamily: {
        // New Amsterdam is condensed: display sizes only.
        amsterdam: ["New Amsterdam", "Arial", "sans-serif"],
        raleway: ["var(--font-raleway)", "system-ui", "sans-serif"],
      },
      animation: {
        text: "text 0.2s ease-in-out infinite",
      },
      keyframes: {
        text: {
          "0%": {
            "background-size": "200% 200%",
            "background-position": "left center",
            transform: "rotate(0deg)",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
            transform: "rotate(180deg)",
          },
          "100%": {
            "background-size": "200% 200%",
            "background-position": "top center",
            transform: "rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
