"use client";
import React, { useEffect, useMemo, useState } from "react";
import PickerModal from "@/app/components/army/PickerModal";
import {
  groupWeapons,
  WeaponTable,
} from "@/app/components/datasheets/WeaponTable";
import StatBlock from "@/app/components/datasheets/StatBlock";
import { factionColor } from "@/app/data/factionColors";
import { API } from "@/app/data/api";
import type { DatasheetHit } from "@/app/types/DatasheetHit";
import type { Weapon } from "@/app/types/Weapon";

interface NamedRef {
  id: string;
  name: string;
}

// /datasheets-leader/:id returns the join rows with the leader loaded.
interface LeaderRow {
  leader: NamedRef;
}

// A read-only "what does this unit do" view: its weapons, and who it can lead /
// be led by. No loadout building -- just the sheet at a glance.
const DatasheetModal: React.FC<{ hit: DatasheetHit; onClose: () => void }> = ({
  hit,
  onClose,
}) => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [leads, setLeads] = useState<NamedRef[] | null>(null);
  const [ledBy, setLedBy] = useState<NamedRef[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setWeapons([]);
    setLeads(null);
    setLedBy(null);
    setLoading(true);

    fetch(`${API}/datasheets-wargear/${hit.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((w: Weapon[]) => !ignore && setWeapons(w))
      .catch(() => {})
      .finally(() => !ignore && setLoading(false));

    // "Who it can lead" -- units this character may join.
    fetch(`${API}/datasheets-leader/${hit.id}/leads`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: NamedRef[]) => !ignore && setLeads(rows))
      .catch(() => !ignore && setLeads([]));

    // "Who it can be led by" -- characters that may join this unit. Skipped in
    // the UI when empty (a character, a vehicle: nothing leads it).
    fetch(`${API}/datasheets-leader/${hit.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(
        (rows: LeaderRow[]) => !ignore && setLedBy(rows.map((x) => x.leader)),
      )
      .catch(() => !ignore && setLedBy([]));

    return () => {
      ignore = true;
    };
  }, [hit.id]);

  const ranged = useMemo(
    () =>
      groupWeapons(
        weapons.filter((w) => w.type !== "Melee"),
        {},
      ),
    [weapons],
  );
  const melee = useMemo(
    () =>
      groupWeapons(
        weapons.filter((w) => w.type === "Melee"),
        {},
      ),
    [weapons],
  );

  const hasLeadership = Boolean(leads?.length || ledBy?.length);

  return (
    <PickerModal
      title={hit.name}
      hint={`${hit.factionName}${hit.role ? ` · ${hit.role}` : ""}`.toUpperCase()}
      onClose={onClose}
    >
      <div
        style={
          { "--accent": factionColor(hit.factionId) } as React.CSSProperties
        }
      >
        {loading ? (
          <div className="border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-white/35">
            LOADING…
          </div>
        ) : (
          <>
            <StatBlock datasheetId={hit.id} />

            <div
              className={
                "grid items-start gap-8 " +
                (hasLeadership ? "lg:grid-cols-[1fr_300px]" : "")
              }
            >
              <div>
                {weapons.length ? (
                  <>
                    <WeaponTable label="Ranged Weapons" rows={ranged} />
                    <WeaponTable label="Melee Weapons" rows={melee} />
                  </>
                ) : (
                  <p className="font-mono text-hud text-white/35">
                    NO WARGEAR LISTED
                  </p>
                )}
              </div>

              {hasLeadership && (
                <div className="flex flex-col gap-5">
                  {leads && leads.length > 0 && (
                    <LeaderList label="Can Lead" units={leads} />
                  )}
                  {ledBy && ledBy.length > 0 && (
                    <LeaderList label="Led By" units={ledBy} />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PickerModal>
  );
};

const LeaderList: React.FC<{ label: string; units: NamedRef[] }> = ({
  label,
  units,
}) => (
  <fieldset className="border border-white/[0.08] p-4">
    <legend className="px-2 font-mono text-hud text-white/45">
      {label.toUpperCase()}
    </legend>
    <ul className="flex flex-col gap-1.5">
      {units.map((u) => (
        <li
          key={u.id}
          className="border border-white/10 px-3 py-2 text-sm text-white/75"
        >
          {u.name}
        </li>
      ))}
    </ul>
  </fieldset>
);

export default DatasheetModal;
