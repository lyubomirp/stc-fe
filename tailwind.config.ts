import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
