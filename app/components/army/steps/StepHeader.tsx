"use client";
import React from "react";
import { accentFade } from "@/app/data/factionColors";

const StepHeader: React.FC<{ title: string; meta: string }> = ({
  title,
  meta,
}) => (
  <>
    <div className="mb-1.5 flex items-baseline justify-between gap-4">
      <h1 className="font-amsterdam text-5xl font-bold uppercase italic text-white">
        {title}
      </h1>
      <span className="shrink-0 font-mono text-[11px] tracking-[0.15em] text-white/45">
        {meta}
      </span>
    </div>
    <div
      className="mb-7 h-px"
      style={{
        backgroundImage: `linear-gradient(90deg, ${accentFade(40)}, transparent)`,
      }}
    />
  </>
);

export default StepHeader;
