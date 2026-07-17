"use client";
import React, { CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TipState } from "@/app/types/TipState";

const RuleTooltip: React.FC<{
  tip: TipState | null;
  onClose: () => void;
}> = ({ tip, onClose }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!tip) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Fixed to the viewport: close rather than drift when the panel scrolls.
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [tip, onClose]);

  if (!mounted || !tip) return null;

  // The panel is a scroll container and would clip an absolute box.
  return createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        role="tooltip"
        style={
          { left: tip.x, top: tip.y, "--accent": tip.accent } as CSSProperties
        }
        className={
          "pointer-events-none fixed z-[61] w-64 max-w-[calc(100vw-1.5rem)] " +
          "-translate-x-1/2 -translate-y-[calc(100%+8px)] " +
          "rounded-sm border border-[color:var(--accent)] bg-black/95 p-3 " +
          "shadow-xl shadow-black/60"
        }
      >
        <p className="text-panel-label font-semibold uppercase text-[color:var(--accent)]">
          {tip.rule.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-white/85">
          {tip.rule.text}
        </p>
      </div>
    </>,
    document.body,
  );
};

export default RuleTooltip;
