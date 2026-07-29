import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import localFont from "next/font/local";
import SessionProvider from "@/app/components/auth/SessionProvider";
import "./globals.css";

// `variable` is what defines --font-raleway. Without it the tailwind
// font-raleway token resolves to nothing and silently falls back to
// New Amsterdam.
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

// Was a remote @import at the top of globals.css, which is the worst way to
// load a font: render-blocking, and discovered only after the CSS parses, so
// the browser could not start fetching until a round trip it did not need.
// Until it landed, all 49 font-amsterdam headings and buttons rendered in Arial
// and then reflowed into a condensed face -- the "garbled" first paint.
//
// localFont rather than next/font/google because New Amsterdam was added to
// Google Fonts after Next 14.2.5, whose bundled list of 1623 fonts does not
// have it. The two woff2 files are the exact ones Google serves, vendored so
// the app makes no third-party request for them.
//
// `adjustFontFallback: "Arial"` is the part that kills the reflow: Next writes
// size-adjust/ascent overrides onto the fallback so Arial occupies nearly the
// same box as the condensed face, and the swap barely moves anything.
const newAmsterdam = localFont({
  src: [
    {
      path: "./fonts/NewAmsterdam-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NewAmsterdam-latin-ext.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  adjustFontFallback: "Arial",
  variable: "--font-amsterdam",
});

export const metadata: Metadata = {
  title: "STC — Standard Template Construct",
  description:
    "Warhammer 40,000 factions, datasheets, weapon profiles and stratagems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Raleway is the default: New Amsterdam is condensed and only legible
          at display sizes, where it is applied explicitly. */}
      <body
        className={`${raleway.variable} ${newAmsterdam.variable} bg-black font-raleway`}
      >
        {/* Unseeded on purpose: this layout must not read cookies, or every
            route under it -- including the static (public) ones -- turns
            dynamic. Inside (protected) a nested provider supplies the
            server-resolved session and shadows this one. */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
