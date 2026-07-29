"use client";
// Temporary visual check for the generated icons.
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import MechanicSvgResolver from "@/app/components/MechanicSvgResolver";

const FACTIONS = [
  "as",
  "ac",
  "adm",
  "tl",
  "ae",
  "am",
  "cd",
  "qt",
  "csm",
  "dg",
  "dru",
  "ec",
  "gc",
  "gk",
  "aoi",
  "qi",
  "lov",
  "nec",
  "ork",
  "sm",
  "ts",
  "tyr",
  "tau",
  "un",
  "we",
];

const MECHANICS = [
  "m",
  "t",
  "sv",
  "w",
  "ld",
  "oc",
  "a",
  "bs",
  "ws",
  "s",
  "ap",
  "d",
  "range",
  "type",
  "melee",
  "assault",
  "heavy",
  "pistol",
  "rapid fire",
  "grenade",
];

export default function Icons() {
  return (
    <div className="min-h-screen bg-black text-white p-10 font-raleway">
      <h1 className="text-3xl mb-6">Mechanics ({MECHANICS.length})</h1>
      <div className="flex flex-wrap gap-8 mb-16">
        {MECHANICS.map((k) => (
          <div key={k} className="flex flex-col items-center gap-2 w-24">
            <MechanicSvgResolver
              mechanic={k}
              className="fill-white w-10 h-10"
            />
            <span className="text-xs opacity-70">{k}</span>
          </div>
        ))}
      </div>

      <h1 className="text-3xl mb-6">Factions ({FACTIONS.length})</h1>
      <div className="flex flex-wrap gap-8">
        {FACTIONS.map((k) => (
          <div key={k} className="flex flex-col items-center gap-2 w-24">
            <FactionSvgResolver
              factionId={k}
              className="fill-white w-10 h-10"
            />
            <span className="text-xs opacity-70">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
