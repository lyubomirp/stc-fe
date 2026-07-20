"use client";
import React from "react";
import StepHeader from "@/app/components/army/steps/StepHeader";
import DetachmentPanel from "@/app/components/army/DetachmentPanel";
import { accentFade } from "@/app/data/factionColors";
import { detachmentSubfaction } from "@/app/data/detachmentSubfactions";
import type { Faction } from "@/app/store/factionStore";
import type { Ability } from "@/app/types/Ability";
import type { DetachmentRef } from "@/app/types/DetachmentRef";

const SCALES = [
  { id: "patrol", name: "Combat Patrol", pts: 500 },
  { id: "incursion", name: "Incursion", pts: 1000 },
  { id: "strike", name: "Strike Force", pts: 2000 },
  { id: "onslaught", name: "Onslaught", pts: 3000 },
];

const DetachmentStep: React.FC<{
  faction: Faction;
  subfaction: string | null;
  detachments: DetachmentRef[];
  abilities: Ability[];
  unitCount?: number;
  cap: number;
  onCap: (pts: number) => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onContinue: () => void;
}> = ({
  faction,
  subfaction,
  detachments,
  abilities,
  unitCount,
  cap,
  onCap,
  selected,
  onSelect,
  onContinue,
}) => {
  // Custom mode is tracked explicitly: a custom value can coincide with a named
  // one, so it cannot be derived from `cap` alone.
  const [custom, setCustom] = React.useState(
    () => !SCALES.some((s) => s.pts === cap),
  );

  // Boarding Actions is a separate game mode.
  const standard = detachments.filter((d) => d.type === null);

  const owned = (name: string) => detachmentSubfaction(name);
  const shown = subfaction
    ? standard.filter((d) => {
        const owner = owned(d.name);
        return owner === null || owner === subfaction;
      })
    : standard;

  const hidden = standard.length - shown.length;

  const stillShown = shown.some((d) => d.id === selected);
  if (selected && !stillShown) onSelect(null);

  return (
    <>
      <StepHeader
        title="Choose Detachment"
        meta={`STEP 1 / 2 · ${shown.length} AVAILABLE${hidden ? ` · ${hidden} CHAPTER-LOCKED` : ""}`}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[220px_1fr_320px]">
        <div className="border border-white/[0.08] p-4">
          <div className="mb-3 font-mono text-hud text-white/45">
            ENGAGEMENT SCALE
          </div>
          <div className="flex flex-col gap-2">
            {SCALES.map((s) => {
              const on = !custom && cap === s.pts;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCustom(false);
                    onCap(s.pts);
                  }}
                  style={
                    on
                      ? {
                          borderColor: "var(--accent)",
                          backgroundImage: `linear-gradient(135deg, ${accentFade(16)}, rgba(255,255,255,0.01))`,
                          boxShadow: `0 0 16px ${accentFade(25)}`,
                        }
                      : undefined
                  }
                  className={
                    "flex w-full items-center justify-between border p-3 text-sm font-semibold transition-colors " +
                    (on
                      ? "text-white"
                      : "border-white/[0.09] bg-white/[0.014] text-white/70 hover:border-white/25 hover:text-white")
                  }
                >
                  <span>{s.name}</span>
                  <span
                    className={
                      "font-mono text-[10px] " +
                      (on ? "text-[color:var(--accent)]" : "text-white/45")
                    }
                  >
                    {s.pts} PTS
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCustom(true)}
              style={
                custom
                  ? {
                      borderColor: "var(--accent)",
                      backgroundImage: `linear-gradient(135deg, ${accentFade(16)}, rgba(255,255,255,0.01))`,
                      boxShadow: `0 0 16px ${accentFade(25)}`,
                    }
                  : undefined
              }
              className={
                "flex w-full items-center justify-between border p-3 text-sm font-semibold transition-colors " +
                (custom
                  ? "text-white"
                  : "border-white/[0.09] bg-white/[0.014] text-white/70 hover:border-white/25 hover:text-white")
              }
            >
              <span>Custom</span>
              <span
                className={
                  "font-mono text-[10px] " +
                  (custom ? "text-[color:var(--accent)]" : "text-white/45")
                }
              >
                SET PTS
              </span>
            </button>

            {custom && (
              <label className="flex items-center gap-2 border border-white/[0.09] bg-white/[0.014] p-3">
                <input
                  type="number"
                  min={1}
                  step={5}
                  value={cap}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    onCap(Number.isFinite(n) && n > 0 ? n : 0);
                  }}
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Custom points"
                />
                <span className="font-mono text-[10px] text-white/45">PTS</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {shown.map((d) => {
            const on = selected === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(on ? null : d.id)}
                style={
                  on
                    ? {
                        borderColor: "var(--accent)",
                        backgroundImage: `linear-gradient(135deg, ${accentFade(12)}, rgba(255,255,255,0.01))`,
                        boxShadow: `inset 0 0 0 1px ${accentFade(35)}, 0 0 22px ${accentFade(20)}`,
                      }
                    : undefined
                }
                className={
                  "block w-full border p-4 text-left transition-colors " +
                  (on
                    ? ""
                    : "border-white/[0.09] bg-white/[0.014] hover:border-white/25 hover:bg-white/[0.03]")
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-amsterdam text-xl font-bold uppercase leading-none text-white">
                    {d.name}
                  </span>
                  {on && <span className="text-[color:var(--accent)]">✓</span>}
                </div>
              </button>
            );
          })}

          {shown.length === 0 && (
            <div className="col-span-full border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-white/40">
              NO DETACHMENTS RETURNED
            </div>
          )}
        </div>

        <DetachmentPanel
          faction={faction}
          abilities={abilities}
          unitCount={unitCount}
          detachmentCount={shown.length}
          selectedId={selected}
          onContinue={onContinue}
        />
      </div>
    </>
  );
};

export default DetachmentStep;
