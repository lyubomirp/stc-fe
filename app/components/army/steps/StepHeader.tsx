"use client";
import React from "react";
import { accentFade } from "@/app/data/factionColors";

const StepHeader: React.FC<{ title: string; meta: string }> = ({
  title,
  meta,
}) => (
  <>
    {/* Stacked below sm: the meta is shrink-0, so beside a 5xl title it was
        pushed off the right edge of a phone rather than wrapping. */}
    <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <h1 className="font-amsterdam text-3xl font-bold uppercase italic text-white sm:text-5xl">
        {title}
      </h1>
      <span className="font-mono text-[11px] tracking-[0.15em] text-white/45 sm:shrink-0">
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
