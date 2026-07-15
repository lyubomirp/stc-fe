import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

// `variable` is what defines --font-raleway. Without it the tailwind
// font-raleway token resolves to nothing and silently falls back to
// New Amsterdam.
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
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
      <body className={`${raleway.variable} bg-black font-raleway`}>
        {children}
      </body>
    </html>
  );
}
