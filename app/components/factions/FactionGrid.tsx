"use client";
import React from "react";
import FactionCard from "@/app/components/factions/FactionCard";
import { FACTION_META } from "@/app/data/factionMeta";

const ORDER = ["003", "012", "014", "015", "CHA", "IMP", "XEN", "UNA"];

const rank = (factionId: string) => {
  const code = FACTION_META[factionId]?.code;
  const i = ORDER.indexOf(code ?? "");
  return i === -1 ? ORDER.length : i;
};

const FactionGrid: React.FC<{
  factions: any[];
  activeId?: string;
  columns: string;
  onSelect: (faction: any) => void;
}> = ({ factions, activeId, columns, onSelect }) => {
  // Wahapedia ships factions with no datasheets (Unbound Adversaries);
  // there is nothing to show for them.
  const shown = [...factions]
    .filter((f) => FACTION_META[f.id])
    .sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name));

  return (
    <div className={`grid gap-px bg-white/10 ${columns}`}>
      {shown.map((faction) => (
        <FactionCard
          factionData={faction}
          key={faction.id}
          active={faction.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default FactionGrid;
