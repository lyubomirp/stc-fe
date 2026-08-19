"use client";
import React, { useEffect, useState } from "react";
import RichText from "@/app/components/RichText";
import { API } from "@/app/data/api";
import type { DatasheetAbility } from "@/app/types/DatasheetAbility";

// Core and Faction abilities are the shared core-rules text -- averaging ~1900
// characters each, with a flavour line, a worked example and a summary box. The
// unit's OWN rules (Datasheet, Primarch, Wargear, Special...) average ~210.
//
// So the long ones collapse and the short ones do not. Same call, and the same
// reason, as DetachmentPanel opening its stratagems one at a time: six full rule
// texts at once is a wall, and the thing you came to read is the short one.
const COLLAPSED = new Set(["Core", "Faction"]);

// Wahapedia's print order groups by type already, so this only needs to keep the
// order it was given and note where each run starts.
const groupInOrder = (
  abilities: DatasheetAbility[],
): [string, DatasheetAbility[]][] => {
  const out: [string, DatasheetAbility[]][] = [];

  for (const a of abilities) {
    const last = out[out.length - 1];
    if (last && last[0] === a.type) last[1].push(a);
    else out.push([a.type, [a]]);
  }

  return out;
};

const Ability: React.FC<{ ability: DatasheetAbility }> = ({ ability }) => {
  const collapsible = COLLAPSED.has(ability.type);
  const [open, setOpen] = useState(!collapsible);

  return (
    <div className="border border-white/[0.08]">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
        >
          <span className="font-amsterdam text-sm font-bold uppercase tracking-[0.05em] text-[color:var(--accent)]">
            {ability.name}
          </span>
          <span className="font-mono text-[10px] text-white/35">
            {open ? "−" : "+"}
          </span>
        </button>
      ) : (
        <div className="px-3 pt-2 font-amsterdam text-sm font-bold uppercase tracking-[0.05em] text-[color:var(--accent)]">
          {ability.name}
        </div>
      )}

      {open && (
        // RichText, not plain text: the descriptions carry Wahapedia's markup,
        // so keyword styling and the rules tooltips work inside them for free.
        <RichText
          html={ability.description}
          className="px-3 pb-3 pt-1 text-sm leading-relaxed text-white/70"
        />
      )}
    </div>
  );
};

// The unit's abilities. Self-fetching so any modal can drop it in with just a
// datasheet id, exactly like StatBlock.
const AbilityList: React.FC<{ datasheetId: string }> = ({ datasheetId }) => {
  const [abilities, setAbilities] = useState<DatasheetAbility[] | null>(null);

  useEffect(() => {
    let ignore = false;
    setAbilities(null);

    fetch(`${API}/datasheets-abilities/${datasheetId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((a: DatasheetAbility[]) => !ignore && setAbilities(a))
      .catch(() => !ignore && setAbilities([]));

    return () => {
      ignore = true;
    };
  }, [datasheetId]);

  // 1711 of 1712 datasheets have at least one, so an empty section here means
  // the fetch failed or this is the one that genuinely has none. Either way
  // there is nothing to show, and a heading over nothing reads as broken.
  if (!abilities || !abilities.length) return null;

  return (
    <div className="flex flex-col gap-5">
      {groupInOrder(abilities).map(([type, rows], i) => (
        <fieldset key={`${type}-${i}`} className="border-0 p-0">
          <legend className="mb-2 font-mono text-hud text-white/45">
            {type.toUpperCase()}
          </legend>
          <div className="flex flex-col gap-1.5">
            {rows.map((a, j) => (
              <Ability key={`${a.name}-${j}`} ability={a} />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
};

export default AbilityList;
