"use client";
import React, { useState } from "react";
import RichText from "@/app/components/RichText";
import { API } from "@/app/data/api";

interface Named {
  id: string;
  name: string;
  legend?: string | null;
  description?: string | null;
}

interface Overview {
  detachment: Named & { type: string | null };
  rules: Named[];
  stratagems: (Named & { cpCost: number | null; turn: string | null })[];
  enhancements: (Named & { cost: string | null })[];
}

const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="mb-1 mt-4 text-panel-label font-semibold uppercase text-white/40">
    {children}
  </h4>
);

const DetachmentExpander: React.FC<{
  detachment: { id: string; name: string; type: string | null };
}> = ({ detachment }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Overview | null>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);

    if (next && !data) {
      fetch(`${API}/detachments/${detachment.id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(setData)
        .catch((err) => console.log(err));
    }
  };

  return (
    <li className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 py-2 text-left"
      >
        <span className="text-panel-body font-bold text-[color:var(--accent)]">
          {detachment.name}
        </span>
        <span className="shrink-0 text-white/40">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="pb-3">
          {!data && <p className="text-panel-body text-white/30">Loading…</p>}

          {data?.detachment.legend && (
            <RichText html={data.detachment.legend} className="rich-panel" />
          )}

          {data?.rules.map((rule) => (
            <div key={rule.id}>
              <Sub>Detachment Rule</Sub>
              <p className="text-panel-body font-bold text-[color:var(--accent)]">
                {rule.name}
              </p>
              {rule.description && (
                <RichText html={rule.description} className="rich-panel" />
              )}
            </div>
          ))}
          {!!data?.stratagems.length && (
            <>
              <Sub>Stratagems ({data.stratagems.length})</Sub>
              <ul className="flex flex-col gap-1">
                {data.stratagems.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between gap-2 text-panel-body text-white/80"
                  >
                    <span>{s.name}</span>
                    <span className="shrink-0 text-white/40">{s.cpCost}CP</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!!data?.enhancements.length && (
            <>
              <Sub>Enhancements ({data.enhancements.length})</Sub>
              <ul className="flex flex-col gap-1">
                {data.enhancements.map((e) => (
                  <li
                    key={e.id}
                    className="flex justify-between gap-2 text-panel-body text-white/80"
                  >
                    <span>{e.name}</span>
                    <span className="shrink-0 text-white/40">{e.cost}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default DetachmentExpander;
