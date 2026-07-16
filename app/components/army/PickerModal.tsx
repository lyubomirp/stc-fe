"use client";
import React, { useEffect } from "react";

// Portalling is unnecessary here (nothing clips it) but the accent is: the
// overlay sits outside the rail, so callers that need --accent must set it.
const PickerModal: React.FC<{
  title: string;
  hint?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, hint, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl border border-white/10 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="font-amsterdam text-panel-title italic text-white">
              {title}
            </h2>
            {hint && <span className="text-hud text-white/40">{hint}</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-hud text-white/50 transition-colors hover:text-white"
          >
            CLOSE ✕
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default PickerModal;
