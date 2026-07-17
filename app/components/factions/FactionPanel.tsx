"use client";
import React, { useEffect, useState } from "react";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import RichText from "@/app/components/RichText";
import DetachmentExpander from "@/app/components/factions/DetachmentExpander";
import KeywordChips from "@/app/components/factions/KeywordChips";
import { factionCode } from "@/app/data/factionMeta";
import { factionColor } from "@/app/data/factionColors";
import { API } from "@/app/data/api";
import type { FactionOverview } from "@/app/types/FactionOverview";

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-2 text-panel-label font-semibold uppercase text-[color:var(--accent)]">
    {children}
  </h3>
);

const FactionPanel: React.FC<{ faction: any; onClose: () => void }> = ({
  faction,
  onClose,
}) => {
  const [overview, setOverview] = useState<FactionOverview | null>(null);

  useEffect(() => {
    let active = true;
    setOverview(null);

    fetch(`${API}/factions/${faction.id}/overview`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => active && setOverview(data))
      .catch((err) => console.log(err));

    return () => {
      active = false;
    };
  }, [faction.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lore = overview?.abilities.find((a) => a.legend)?.legend;

  return (
    <aside
      style={{ "--accent": factionColor(faction.id) } as React.CSSProperties}
      className={
        "fixed inset-0 z-50 flex flex-col overflow-y-auto bg-black " +
        "md:static md:z-auto md:w-[30%] md:shrink-0 md:border-l md:border-white/10"
      }
    >
      <div className="flex items-start justify-between p-6 pb-0">
        <span className="font-mono text-panel-label text-white/35">
          {factionCode(faction.id)}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-2xl leading-none text-white/50 transition-colors hover:text-[color:var(--accent)]"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-8 p-6">
        <div className="flex items-center gap-4">
          <FactionSvgResolver
            factionId={faction.id}
            className="h-16 w-16 shrink-0 fill-[var(--accent)]"
          />
          <h2 className="font-amsterdam text-panel-title font-bold text-white">
            {faction.name}
          </h2>
        </div>

        {lore && (
          <section>
            <Heading>Lore</Heading>
            <RichText html={lore} className="rich-panel" />
          </section>
        )}
        {/* A faction has as many army rules as Wahapedia lists; EC has two. */}
        {!!overview?.abilities.length && (
          <section>
            <Heading>Army Rules ({overview.abilities.length})</Heading>
            <ul className="flex flex-col gap-4">
              {overview.abilities.map((a) => (
                <li key={a.id}>
                  <p className="text-panel-body font-bold text-[color:var(--accent)]">
                    {a.name}
                  </p>
                  {a.description && (
                    <RichText html={a.description} className="rich-panel" />
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {!!overview?.detachments.length && (
          <section>
            <Heading>Detachments ({overview.detachments.length})</Heading>
            <ul className="flex flex-col">
              {overview.detachments.map((d) => (
                <DetachmentExpander detachment={d} key={d.id} />
              ))}
            </ul>
          </section>
        )}
        {!!overview?.subfactions.length && (
          <section>
            <Heading>Sub-factions</Heading>
            <ul className="flex flex-col gap-1">
              {overview.subfactions.map((s) => (
                <li
                  key={s.keyword}
                  className="flex justify-between text-panel-body text-white/80"
                >
                  <span className="font-bold text-[color:var(--accent)]">
                    {s.keyword}
                  </span>
                  <span className="text-white/40">{s.datasheets}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {!!overview?.keywords.length && (
          <section>
            <Heading>Keywords ({overview.keywords.length})</Heading>
            <KeywordChips factionId={faction.id} keywords={overview.keywords} />
          </section>
        )}

        {!overview && (
          <p className="text-panel-body text-white/30">Establishing link…</p>
        )}
      </div>
    </aside>
  );
};

export default FactionPanel;
