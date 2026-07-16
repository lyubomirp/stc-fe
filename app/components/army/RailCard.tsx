"use client";
import React from "react";
import { accentFade } from "@/app/data/factionColors";

// The rail's selector. Filled reads as "lit": accent border, accent-tinted
// fill and a glowing emblem, held until the selection is cleared -- the same
// contract as an active FactionCard.
const RailCard: React.FC<{
  label: string;
  code?: string;
  name?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}> = ({ label, code, name, icon, onClick }) => {
  const filled = Boolean(name);

  return (
    <button
      type="button"
      onClick={onClick}
      style={
        filled
          ? {
              borderColor: accentFade(30),
              backgroundImage: `linear-gradient(135deg, ${accentFade(10)}, rgba(255,255,255,0.01))`,
            }
          : undefined
      }
      className={
        "flex w-full items-center gap-3 border p-3 text-left transition-colors " +
        (filled
          ? "border-transparent"
          : "border-dashed border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]")
      }
    >
      {icon && (
        <span
          className="h-9 w-9 shrink-0 text-[color:var(--accent)]"
          style={{ filter: `drop-shadow(0 0 8px ${accentFade(60)})` }}
        >
          {icon}
        </span>
      )}

      <span className="min-w-0">
        <span className="block font-mono text-[9px] tracking-[0.15em] text-white/45">
          {filled ? code : label}
        </span>
        <span
          className={
            "block truncate font-amsterdam text-lg font-bold uppercase leading-none " +
            (filled ? "text-white" : "text-white/50")
          }
        >
          {filled ? name : "Select"}
        </span>
      </span>
    </button>
  );
};

export default RailCard;
