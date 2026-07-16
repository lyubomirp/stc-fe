"use client";
import React, { useState } from "react";
import { accentFade } from "@/app/data/factionColors";

const Expander: React.FC<{
  label: string;
  count?: number;
  meta?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ label, count, meta, defaultOpen, children }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <div className="border-t" style={{ borderColor: accentFade(18) }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 py-2.5 text-left"
      >
        <span className="flex items-baseline gap-2">
          <span className="font-mono text-hud text-[color:var(--accent)]">
            {label}
          </span>
          {count !== undefined && (
            <span className="font-mono text-[10px] text-white/35">{count}</span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {meta && (
            <span className="font-mono text-[9px] text-white/30">{meta}</span>
          )}
          <span className="shrink-0 text-white/40">{open ? "−" : "+"}</span>
        </span>
      </button>

      {open && <div className="pb-3">{children}</div>}
    </div>
  );
};

export default Expander;
