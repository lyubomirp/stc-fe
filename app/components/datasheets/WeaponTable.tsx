"use client";
import React from "react";
import { accentFade } from "@/app/data/factionColors";
import type { Weapon } from "@/app/types/Weapon";
import type { WeaponGroup } from "@/app/types/WeaponGroup";

// Wahapedia splits a weapon's profiles with an en dash on 1408 rows and a plain
// hyphen on 36 ("Blood talons - strike"). Both are 3 chars wide with the spaces.
const PROFILE_SPLIT = / [–-] /;

// One row per weapon, not per profile: the cap belongs to the weapon, and
// repeating "x2" on both Blastmaster profiles reads as four blastmasters.
export const groupWeapons = (
  rows: Weapon[],
  caps: Record<string, number>,
): WeaponGroup[] => {
  const out: WeaponGroup[] = [];
  const byBase = new Map<string, WeaponGroup>();

  for (const weapon of rows) {
    const at = weapon.name.search(PROFILE_SPLIT);
    const base = at < 0 ? weapon.name : weapon.name.slice(0, at);
    const profile = at < 0 ? null : weapon.name.slice(at + 3);
    const key = base.toLowerCase();

    let group = byBase.get(key);

    if (!group) {
      group = { base, cap: caps[key], profiles: [] };
      byBase.set(key, group);
      out.push(group);
    }

    group.profiles.push({ profile, weapon });
  }

  return out;
};

const Stats: React.FC<{ weapon: Weapon }> = ({ weapon }) => (
  <>
    {[weapon.range, weapon.a, weapon.bsWs, weapon.s, weapon.ap, weapon.d].map(
      (v, j) => (
        <td
          key={j}
          className="px-3 py-2 text-center font-mono text-sm text-white/70"
        >
          {j === 0 && v && v !== "Melee" ? `${v}"` : (v ?? "—")}
        </td>
      ),
    )}
  </>
);

const Abilities: React.FC<{ text: string | null }> = ({ text }) =>
  text ? (
    <div className="mt-0.5 font-mono text-[10px] text-[color:var(--accent)]">
      {text.toUpperCase()}
    </div>
  ) : null;

const Cap: React.FC<{ cap?: number }> = ({ cap }) =>
  cap == null ? null : (
    <span
      style={{ borderColor: accentFade(45) }}
      className="ml-2 shrink-0 border px-1.5 py-px font-mono text-[10px] text-[color:var(--accent)]"
      title={`This unit may take at most ${cap}`}
    >
      MAX {cap}
    </span>
  );

export const WeaponTable: React.FC<{ label: string; rows: WeaponGroup[] }> = ({
  label,
  rows,
}) => {
  if (!rows.length) return null;

  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-2 font-mono text-hud text-white/45">
        {label.toUpperCase()}
      </div>

      {/* Wide content scrolls itself rather than stretching the modal. */}
      <div className="overflow-x-auto border border-white/[0.08]">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {["Weapon", "Range", "A", "BS/WS", "S", "AP", "D"].map((h) => (
                <th
                  key={h}
                  className={
                    "px-3 py-2 font-mono text-[10px] font-normal tracking-[0.1em] text-white/40 " +
                    (h === "Weapon" ? "" : "w-[9%] text-center")
                  }
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => {
              const single =
                g.profiles.length === 1 && g.profiles[0].profile === null;

              // Single-profile weapon: name and stats on one row.
              if (single) {
                const { weapon } = g.profiles[0];

                return (
                  <tr
                    key={g.base}
                    className="border-b border-white/[0.05] last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-baseline">
                        <span className="text-sm text-white/85">{g.base}</span>
                        <Cap cap={g.cap} />
                      </div>
                      <Abilities text={weapon.description} />
                    </td>
                    <Stats weapon={weapon} />
                  </tr>
                );
              }

              // Multi-profile: the weapon is named once and carries the cap;
              // its profiles are the rows beneath it.
              return (
                <React.Fragment key={g.base}>
                  <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                    <td colSpan={7} className="px-3 pb-1 pt-2">
                      <div className="flex items-baseline">
                        <span className="text-sm font-semibold text-white/85">
                          {g.base}
                        </span>
                        <Cap cap={g.cap} />
                      </div>
                    </td>
                  </tr>

                  {g.profiles.map(({ profile, weapon }, i) => (
                    <tr
                      key={`${g.base}-${profile ?? i}`}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="py-2 pl-7 pr-3">
                        <div className="text-sm text-white/60">
                          {profile ?? g.base}
                        </div>
                        <Abilities text={weapon.description} />
                      </td>
                      <Stats weapon={weapon} />
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
