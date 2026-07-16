"use client";
import React, { useState } from "react";
import StepHeader from "@/app/components/army/steps/StepHeader";
import { accentFade, ON_ACCENT } from "@/app/data/factionColors";

// Mock, straight from the design. Real values come from the datasheet,
// wargear and options endpoints.
const STATS = [
  { k: "M", v: '6"' },
  { k: "T", v: "4" },
  { k: "SV", v: "3+" },
  { k: "W", v: "2" },
  { k: "LD", v: "6+" },
  { k: "OC", v: "2" },
];

const WEAPONS = [
  { id: "bolt", label: "Bolt Rifle" },
  { id: "auto", label: "Auto Bolt Rifle" },
  { id: "stalker", label: "Stalker Bolt Rifle" },
];

const SGT = [
  { id: "fist", label: "Power Fist", cost: 5 },
  { id: "sword", label: "Power Sword", cost: 5 },
  { id: "gl", label: "Astartes Grenade Launcher", cost: 5 },
];

const BASE = 85;

const LoadoutStep: React.FC = () => {
  const [weapon, setWeapon] = useState("bolt");
  const [sgt, setSgt] = useState<Record<string, boolean>>({
    fist: true,
    sword: true,
    gl: false,
  });

  const upgrades = SGT.reduce((a, e) => a + (sgt[e.id] ? e.cost : 0), 0);

  const optionClass = (on: boolean) =>
    "flex w-full items-center gap-3.5 border p-3.5 text-left text-[15px] font-semibold transition-colors " +
    (on
      ? "text-white"
      : "border-white/[0.09] bg-white/[0.014] text-white/80 hover:border-white/25 hover:text-white");

  const optionStyle = (on: boolean) =>
    on
      ? {
          borderColor: "var(--accent)",
          backgroundImage: `linear-gradient(135deg, ${accentFade(12)}, rgba(255,255,255,0.01))`,
          boxShadow: `0 0 16px ${accentFade(20)}`,
        }
      : undefined;

  return (
    <>
      <StepHeader title="Loadout" meta="STEP 3 / 3 · INTERCESSOR SQUAD" />

      <div className="grid items-start gap-6 xl:grid-cols-[300px_1fr_300px]">
        <div>
          <div
            className="mb-3.5 flex aspect-square items-center justify-center border"
            style={{
              borderColor: accentFade(28),
              background: accentFade(4),
            }}
          >
            <span className="font-mono text-[10px] tracking-[0.15em] text-white/25">
              NO RENDER
            </span>
          </div>
          <div className="mb-3 font-mono text-hud text-[color:var(--accent)]">
            DATASHEET
          </div>
          <div className="grid grid-cols-4 gap-2">
            {STATS.map((s) => (
              <div
                key={s.k}
                className="border border-white/10 px-1.5 py-2.5 text-center"
              >
                <div className="font-mono text-[10px] tracking-[0.1em] text-white/45">
                  {s.k}
                </div>
                <div className="font-amsterdam text-2xl font-bold leading-tight text-white">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 font-amsterdam text-[22px] font-bold uppercase text-white">
            Primary Armament
          </div>
          <div className="mb-3.5 font-mono text-[10px] tracking-[0.1em] text-white/40">
            SELECT 1
          </div>
          <div className="mb-7 flex flex-col gap-2.5">
            {WEAPONS.map((w) => {
              const on = weapon === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeapon(w.id)}
                  style={optionStyle(on)}
                  className={optionClass(on)}
                >
                  <span
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: on
                        ? "var(--accent)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: on ? "var(--accent)" : "transparent",
                      }}
                    />
                  </span>
                  <span className="flex-1">{w.label}</span>
                  <span className="font-mono text-[11px] text-white/45">
                    +0
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-1.5 font-amsterdam text-[22px] font-bold uppercase text-white">
            Sergeant Equipment
          </div>
          <div className="mb-3.5 font-mono text-[10px] tracking-[0.1em] text-white/40">
            SELECT ANY
          </div>
          <div className="flex flex-col gap-2.5">
            {SGT.map((e) => {
              const on = Boolean(sgt[e.id]);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSgt((s) => ({ ...s, [e.id]: !s[e.id] }))}
                  style={optionStyle(on)}
                  className={optionClass(on)}
                >
                  <span
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center border-2"
                    style={{
                      borderColor: on
                        ? "var(--accent)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    <span
                      className="h-2 w-2"
                      style={{
                        background: on ? "var(--accent)" : "transparent",
                      }}
                    />
                  </span>
                  <span className="flex-1">{e.label}</span>
                  <span
                    className={
                      "font-mono text-[11px] " +
                      (on ? "text-[color:var(--accent)]" : "text-white/45")
                    }
                  >
                    +{e.cost} PTS
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="border p-5"
          style={{
            borderColor: accentFade(28),
            backgroundImage: `linear-gradient(180deg, ${accentFade(7)}, rgba(10,10,13,0.4))`,
          }}
        >
          <div className="mb-4 font-mono text-hud text-[color:var(--accent)]">
            POINTS SUMMARY
          </div>
          <div className="flex items-baseline justify-between border-b border-white/[0.08] py-2.5">
            <span className="text-sm text-white/70">Base Unit</span>
            <span className="font-mono text-[15px] text-white/90">
              {BASE} PTS
            </span>
          </div>
          <div className="flex items-baseline justify-between border-b border-white/[0.08] py-2.5">
            <span className="text-sm text-white/70">Upgrades</span>
            <span className="font-mono text-[15px] text-[color:var(--accent)]">
              +{upgrades} PTS
            </span>
          </div>
          <div className="flex items-baseline justify-between pb-5 pt-4">
            <span className="font-amsterdam text-xl font-bold uppercase text-white">
              Total
            </span>
            <span className="font-amsterdam text-3xl font-bold leading-none text-white">
              {BASE + upgrades}{" "}
              <span className="text-[15px] text-white/45">PTS</span>
            </span>
          </div>
          <button
            type="button"
            style={{ background: "var(--accent)", color: ON_ACCENT }}
            className="w-full p-3.5 font-amsterdam text-base font-bold uppercase tracking-[0.1em] transition-[filter] hover:brightness-110"
          >
            Confirm Loadout
          </button>
        </div>
      </div>
    </>
  );
};

export default LoadoutStep;
