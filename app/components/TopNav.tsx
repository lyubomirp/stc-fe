"use client";
import React from "react";

// Datasheets/Army Builder are inert until routing exists.
const TABS = ["Factions", "Datasheets", "Army Builder"];

const TopNav: React.FC<{ active?: string }> = ({ active = "Factions" }) => {
  return (
    <nav className="flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-4">
        <span className="font-amsterdam text-lg font-bold tracking-widest text-white">
          STC
        </span>
        <span className="flex items-center gap-2 text-hud text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          LIVE LINK ESTABLISHED
        </span>
      </div>

      <div className="flex items-center gap-8">
        {TABS.map((tab) => (
          <span
            key={tab}
            className={
              tab === active
                ? "border-b border-fuchsia-400 pb-1 text-sm text-fuchsia-400"
                : "pb-1 text-sm text-white/50"
            }
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="w-24" />
    </nav>
  );
};

export default TopNav;
