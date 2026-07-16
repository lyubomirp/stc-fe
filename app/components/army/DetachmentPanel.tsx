"use client";
import React, { useEffect, useState } from "react";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import RichText from "@/app/components/RichText";
import Expander from "@/app/components/army/Expander";
import { accentFade, ON_ACCENT } from "@/app/data/factionColors";
import { FACTION_META } from "@/app/data/factionMeta";
import { API } from "@/app/data/api";
import type { Faction } from "@/app/store/factionStore";

interface Named {
  id: string;
  name: string;
  legend?: string | null;
  description?: string | null;
}

interface Detail {
  detachment: Named & { type: string | null };
  rules: Named[];
  stratagems: (Named & {
    cpCost: number | null;
    turn: string | null;
    phase: string | null;
    type: string | null;
  })[];
  enhancements: (Named & { cost: string | null })[];
}

// Each stratagem opens on its own: six full rule texts at once in a 320px
// column is a wall, and you only ever read one at a time.
const Stratagem: React.FC<{ s: Detail["stratagems"][number] }> = ({ s }) => {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-baseline justify-between gap-2 py-2 text-left"
      >
        <span className="text-sm font-semibold text-white/85">{s.name}</span>
        <span className="shrink-0 font-mono text-[11px] font-bold text-[color:var(--accent)]">
          {s.cpCost}CP
        </span>
      </button>

      {open && (
        <div className="pb-2">
          {(s.turn || s.phase) && (
            <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-white/35">
              {[s.turn, s.phase].filter(Boolean).join(" · ").toUpperCase()}
            </div>
          )}
          {s.description && <RichText html={s.description} />}
        </div>
      )}
    </li>
  );
};

const DetachmentPanel: React.FC<{
  faction: Faction;
  abilities: { id: string; name: string; description: string }[];
  unitCount?: number;
  detachmentCount: number;
  selectedId: string | null;
  onContinue: () => void;
}> = ({
  faction,
  abilities,
  unitCount,
  detachmentCount,
  selectedId,
  onContinue,
}) => {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let live = true;
    setLoading(true);
    setDetail(null);

    fetch(`${API}/detachments/${selectedId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => live && setDetail(j))
      .catch(() => live && setDetail(null))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, [selectedId]);

  const ruleName = FACTION_META[faction.id]?.armyRule;
  const armyRule = abilities.find((a) => a.name === ruleName);

  return (
    <div
      className="border p-5"
      style={{
        borderColor: accentFade(28),
        backgroundImage: `linear-gradient(180deg, ${accentFade(7)}, rgba(10,10,13,0.4))`,
      }}
    >
      <div className="mb-5 flex items-center gap-3.5">
        <span
          className="h-11 w-11 shrink-0 text-[color:var(--accent)]"
          style={{ filter: `drop-shadow(0 0 10px ${accentFade(60)})` }}
        >
          <FactionSvgResolver
            factionId={faction.id}
            className="h-full w-full fill-current"
          />
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[9px] tracking-[0.15em] text-white/45">
            SELECTED FACTION
          </div>
          <div className="font-amsterdam text-2xl font-bold uppercase leading-none text-white">
            {faction.name}
          </div>
        </div>
      </div>

      {/* No detachment picked yet: the army rule is the thing that applies. */}
      {!selectedId && (
        <>
          {ruleName && (
            <>
              <div className="mb-2 font-mono text-hud text-[color:var(--accent)]">
                ARMY RULE
              </div>
              <div className="mb-1.5 font-amsterdam text-lg font-bold text-white/95">
                {ruleName}
              </div>
              {armyRule ? (
                <RichText html={armyRule.description} className="mb-5" />
              ) : (
                <p className="mb-5 text-sm text-white/40">
                  Rule text unavailable for this faction.
                </p>
              )}
            </>
          )}
          <p className="mb-5 border border-dashed border-white/12 p-3 text-center font-mono text-[10px] tracking-[0.1em] text-white/35">
            SELECT A DETACHMENT
          </p>
        </>
      )}

      {selectedId && loading && (
        <p className="mb-5 font-mono text-[10px] tracking-[0.1em] text-white/35">
          LOADING…
        </p>
      )}

      {detail && (
        <>
          <div className="mb-2 font-mono text-hud text-[color:var(--accent)]">
            DETACHMENT
          </div>
          <div className="mb-3 font-amsterdam text-xl font-bold uppercase leading-none text-white">
            {detail.detachment.name}
          </div>

          {detail.detachment.legend && (
            <RichText html={detail.detachment.legend} className="mb-3" />
          )}

          {detail.rules.map((r) => (
            <div key={r.id} className="mb-4">
              <div className="mb-1 font-amsterdam text-base font-bold text-white/95">
                {r.name}
              </div>
              {r.description && <RichText html={r.description} />}
            </div>
          ))}

          <Expander label="STRATAGEMS" count={detail.stratagems.length}>
            {detail.stratagems.length ? (
              <ul className="flex flex-col">
                {detail.stratagems.map((s) => (
                  <Stratagem key={s.id} s={s} />
                ))}
              </ul>
            ) : (
              <p className="py-2 text-sm text-white/35">None.</p>
            )}
          </Expander>

          <Expander label="ENHANCEMENTS" count={detail.enhancements.length}>
            {detail.enhancements.length ? (
              <ul className="flex flex-col">
                {detail.enhancements.map((e) => (
                  <li
                    key={e.id}
                    className="border-b border-white/[0.06] py-2 last:border-b-0"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-white/85">
                        {e.name}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] font-bold text-[color:var(--accent)]">
                        {e.cost}
                      </span>
                    </div>
                    {e.description && <RichText html={e.description} />}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-sm text-white/35">None.</p>
            )}
          </Expander>

          <div className="mb-5" />
        </>
      )}

      <div className="mb-5 flex gap-6">
        <div>
          <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-white/45">
            AVAILABLE UNITS
          </div>
          <div className="font-amsterdam text-2xl font-bold text-white">
            {unitCount ?? "—"}
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-white/45">
            DETACHMENTS
          </div>
          <div className="font-amsterdam text-2xl font-bold text-white">
            {detachmentCount}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selectedId}
        style={
          selectedId
            ? { background: "var(--accent)", color: ON_ACCENT }
            : undefined
        }
        className={
          "w-full p-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] transition-[filter] " +
          (selectedId
            ? "hover:brightness-110"
            : "cursor-not-allowed border border-white/10 text-white/25")
        }
      >
        Continue to Roster →
      </button>
    </div>
  );
};

export default DetachmentPanel;
