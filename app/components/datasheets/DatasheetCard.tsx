"use client";
import React from "react";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import { factionColor } from "@/app/data/factionColors";
import type { DatasheetHit } from "@/app/types/DatasheetHit";

// Faction on top, faction logo as a corner watermark, unit name in the middle.
// Height is left to the content so long names simply grow the card; the grid
// aligns cards to their top, so uneven heights read fine.
const DatasheetCard: React.FC<{ hit: DatasheetHit; onOpen: () => void }> = ({
  hit,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    style={{ "--accent": factionColor(hit.factionId) } as React.CSSProperties}
    className="group relative flex min-h-[9rem] flex-col overflow-hidden border border-white/10 bg-white/[0.02] p-5 text-left transition-colors hover:border-[color:var(--accent)] hover:bg-white/[0.06] focus:outline-none focus-visible:border-[color:var(--accent)]"
  >
    <span className="text-rule font-semibold uppercase text-[color:var(--accent)]">
      {hit.factionName}
    </span>

    <span className="mt-6 font-amsterdam text-card font-bold uppercase leading-tight text-white">
      {hit.name}
    </span>

    <FactionSvgResolver
      factionId={hit.factionId}
      className="pointer-events-none absolute -right-3 bottom-2 h-20 w-20 fill-white opacity-[0.06] transition-all duration-300 group-hover:fill-[var(--accent)] group-hover:opacity-60 group-hover:scale-105"
    />
  </button>
);

export default DatasheetCard;
