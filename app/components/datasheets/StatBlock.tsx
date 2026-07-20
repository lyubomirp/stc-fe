"use client";
import React, { useEffect, useState } from "react";
import { API } from "@/app/data/api";

interface ModelRow {
  id: number;
  name: string | null;
  m: string;
  t: string;
  sv: string;
  invSv: string | null;
  invSvDescr: string | null;
  w: string;
  ld: string;
  oc: string;
}

// invSv arrives bare ("4") or as "-"/null for none. Show "4+" or a dash.
const invuln = (r: ModelRow): string => {
  const v = (r.invSv ?? "").trim();
  if (!v || v === "-") return "—";
  return /\+$/.test(v) ? v : `${v}+`;
};

const CELL = "px-3 py-2 text-center font-mono text-sm text-white/80";
const HEAD =
  "px-3 py-2 text-center font-mono text-[10px] font-normal tracking-[0.1em] text-white/40";

// The datasheet stat line (M/T/SV/INV/W/LD/OC), one row per model profile.
// Self-fetching so any modal can drop it in with just a datasheet id.
const StatBlock: React.FC<{ datasheetId: string }> = ({ datasheetId }) => {
  const [rows, setRows] = useState<ModelRow[] | null>(null);

  useEffect(() => {
    let ignore = false;
    setRows(null);

    fetch(`${API}/datasheets-models/${datasheetId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((m: ModelRow[]) => !ignore && setRows(m))
      .catch(() => !ignore && setRows([]));

    return () => {
      ignore = true;
    };
  }, [datasheetId]);

  if (!rows || !rows.length) return null;

  // Only name the rows when there is more than one profile to tell apart.
  const named = rows.length > 1;

  return (
    <div className="mb-6">
      <div className="mb-2 font-mono text-hud text-white/45">STATS</div>

      <div className="overflow-x-auto border border-white/[0.08]">
        <table className="w-full min-w-[440px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {named && <th className={`${HEAD} text-left`}>MODEL</th>}
              {["M", "T", "SV", "INV", "W", "LD", "OC"].map((h) => (
                <th key={h} className={HEAD}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                {named && (
                  <td className="px-3 py-2 text-sm text-white/80">{r.name}</td>
                )}
                <td className={CELL}>{r.m}</td>
                <td className={CELL}>{r.t}</td>
                <td className={CELL}>{r.sv}</td>
                <td className={CELL} title={r.invSvDescr ?? undefined}>
                  {invuln(r)}
                </td>
                <td className={CELL}>{r.w}</td>
                <td className={CELL}>{r.ld}</td>
                <td className={CELL}>{r.oc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatBlock;
