"use client";
import React from "react";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import { FACTION_META, factionCode } from "@/app/data/factionMeta";
import { factionColor } from "@/app/data/factionColors";

const FactionCard: React.FC<{
  factionData: any;
  active?: boolean;
  onSelect: (faction: any) => void;
}> = ({ factionData, active, onSelect }) => {
  const meta = FACTION_META[factionData.id];

  // Tailwind cannot build class names at runtime, so the accent travels as a
  // custom property and the classes below read it.
  const accent = { "--accent": factionColor(factionData.id) };

  return (
    <button
      type="button"
      style={accent as React.CSSProperties}
      onClick={() => onSelect(factionData)}
      className={
        "group relative flex h-44 flex-col overflow-hidden border border-white/10 " +
        "p-6 text-left transition-colors duration-300 " +
        (active
          ? "bg-white/[0.08] border-[color:var(--accent)] "
          : "bg-white/[0.02] ") +
        "hover:bg-white/[0.06] hover:border-[color:var(--accent)] " +
        "focus:outline-none focus-visible:border-[color:var(--accent)]"
      }
    >
      <span className="font-mono text-hud text-white/35">
        {factionCode(factionData.id)}
      </span>

      <span className="mt-6 text-rule font-semibold uppercase text-[color:var(--accent)]">
        {meta?.armyRule ?? " "}
      </span>

      <span className="mt-1 font-amsterdam text-card font-bold text-white">
        {factionData.name}
      </span>

      {/* Active restates the hover treatment: the panel stays open after the
          mouse leaves, and the icon must not drop back to 0.07. */}
      <FactionSvgResolver
        factionId={factionData.id}
        className={
          "pointer-events-none absolute -right-3 bottom-2 h-24 w-24 " +
          "transition-all duration-300 " +
          (active
            ? "fill-[var(--accent)] opacity-70 scale-105 "
            : "fill-white opacity-[0.07] ") +
          "group-hover:fill-[var(--accent)] group-hover:opacity-70 " +
          "group-hover:scale-105"
        }
      />
    </button>
  );
};

export default FactionCard;
