"use client";
import React, { useState } from "react";
import { API } from "@/app/data/api";
import type { Keyword } from "@/app/types/Keyword";
import type { KeywordUnit } from "@/app/types/KeywordUnit";

const KeywordChips: React.FC<{
  factionId: string;
  keywords: Keyword[];
}> = ({ factionId, keywords }) => {
  const [open, setOpen] = useState<string | null>(null);
  const [units, setUnits] = useState<KeywordUnit[]>([]);

  const toggle = (keyword: string) => {
    if (open === keyword) {
      setOpen(null);
      return;
    }

    setOpen(keyword);
    setUnits([]);

    fetch(
      `${API}/factions/${factionId}/keywords/${encodeURIComponent(keyword)}`,
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setUnits)
      .catch((err) => console.log(err));
  };

  return (
    // A w-full item forces a wrap, so the panel opens on its own line
    // directly beneath the chip that was clicked -- no absolute
    // positioning to be clipped by the panel's scroll container.
    <div className="flex flex-wrap items-start gap-1.5">
      {keywords.map((k) => (
        <React.Fragment key={k.keyword}>
          <button
            type="button"
            onClick={() => toggle(k.keyword)}
            title={`${k.units} unit${k.units === 1 ? "" : "s"}`}
            className={
              "rounded-sm bg-[color:var(--accent)] px-2 py-0.5 " +
              // Every accent is light (they are chosen to read on black),
              // so the label has to be dark: white scores ~1.5:1 on most.
              "text-chip text-black transition-opacity " +
              (open === k.keyword
                ? "opacity-100 ring-1 ring-white/60"
                : "opacity-80 hover:opacity-100")
            }
          >
            {k.keyword}
          </button>

          {open === k.keyword && (
            <div className="w-full border-l-2 border-[color:var(--accent)] pl-3">
              <p className="text-panel-label uppercase text-white/40">
                {k.units} unit{k.units === 1 ? "" : "s"}
              </p>
              {!units.length ? (
                <p className="text-panel-body text-white/30">Loading…</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {units.map((u) => (
                    <li
                      key={u.id}
                      className="flex justify-between gap-2 text-panel-body text-white/80"
                    >
                      <span>{u.name}</span>
                      <span className="shrink-0 text-white/30">{u.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default KeywordChips;
