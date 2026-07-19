"use client";
import React, { useEffect, useMemo, useState } from "react";
import PickerModal from "@/app/components/army/PickerModal";
import RichText from "@/app/components/RichText";
import { accentFade, ON_ACCENT } from "@/app/data/factionColors";
import { API } from "@/app/data/api";
import type { AttachTarget } from "@/app/types/AttachTarget";
import type { Choice } from "@/app/types/Choice";
import type { Datasheet } from "@/app/types/Datasheet";
import type { Enhancement } from "@/app/types/Enhancement";
import type { OptionNode } from "@/app/types/OptionNode";
import type { WargearPick } from "@/app/types/WargearPick";
import type { Weapon } from "@/app/types/Weapon";
import type { WeaponGroup } from "@/app/types/WeaponGroup";

// The empty uid is the "no attachment" choice; a real uid is never empty.
const NOT_ATTACHED: AttachTarget[] = [
  {
    uid: "",
    datasheetId: "",
    name: "Not attached",
    costLabel: null,
    ledBy: null,
  },
];

// Wahapedia splits a weapon's profiles with an en dash on 1408 rows and a plain
// hyphen on 36 ("Blood talons - strike"). Both are 3 chars wide with the spaces.
const PROFILE_SPLIT = / [–-] /;

// One row per weapon, not per profile: the cap belongs to the weapon, and
// repeating "x2" on both Blastmaster profiles reads as four blastmasters.
const groupWeapons = (
  rows: Weapon[],
  caps: Record<string, number>,
): WeaponGroup[] => {
  const out: WeaponGroup[] = [];
  const byBase = new Map<string, WeaponGroup>();

  for (const weapon of rows) {
    const at = weapon.name.search(PROFILE_SPLIT);
    const base = at < 0 ? weapon.name : weapon.name.slice(0, at);
    const profile = at < 0 ? null : weapon.name.slice(at + 3);
    const key = base.toLowerCase();

    let group = byBase.get(key);

    if (!group) {
      group = { base, cap: caps[key], profiles: [] };
      byBase.set(key, group);
      out.push(group);
    }

    group.profiles.push({ profile, weapon });
  }

  return out;
};

const isExclusive = (n: OptionNode) =>
  n.kind === "group" && n.max === 1 && (n.min == null || n.min === 1);

// A model carries its weapons as children; a weapon carries nothing. Without
// that test the Chaos Land Raider's "Soulshatter lascannon {min=2 max=2}" -- a
// gun mounted twice -- reads as a squad of two vehicles.
const isModel = (n: OptionNode) =>
  n.max != null && n.max > 1 && (n.children ?? []).length > 0;

// The squad's model pool. BSData states it three different ways and all three
// occur in EC alone -- read only one and whole units silently report no
// composition:
//
//   group with limits         "5 Noise Marines {min=5 max=5}"     Noise Marines
//   group wrapping the limits "4-9 Infractors {}" > "Infractor {min=4 max=9}"
//   no group at all           "Daemonette {min=9 max=9}"          Daemonettes
const poolOf = (
  nodes: OptionNode[],
): { name: string; min?: number; max?: number } | null => {
  for (const n of nodes) {
    if (isModel(n)) return { name: n.name, min: n.min, max: n.max };

    if (n.kind !== "group") continue;

    const kid = (n.children ?? []).find(
      (c) => c.kind === "entry" && isModel(c),
    );

    if (kid) return { name: n.name, min: kid.min, max: kid.max };
  }

  return null;
};

// The sergeant/champion: a top-level entry taken exactly once. Only meaningful
// beside a pool -- single-model characters (Fulgrim, Lucius) carry their
// *weapons* as top-level {min=1 max=1} entries and have no pool.
const championsOf = (nodes: OptionNode[]): string[] =>
  poolOf(nodes)
    ? nodes
        .filter(
          (n) =>
            n.kind === "entry" &&
            n.min === 1 &&
            n.max === 1 &&
            (n.children ?? []).length > 0,
        )
        .map((n) => n.name)
    : [];

// Flattens every exclusive group to a radio set, carrying the enclosing entry
// names as a trail so "Obsessionist > Pistol" stays distinguishable.
const collectChoices = (
  nodes: OptionNode[],
  trail: string[] = [],
  base: number[] = [],
): Choice[] =>
  nodes.flatMap((n, i) => {
    const path = [...base, i];

    if (isExclusive(n)) {
      return [
        {
          path: path.join("."),
          group: n.name,
          trail,
          options: (n.children ?? []).map((c) => c.name),
        },
      ];
    }

    return collectChoices(
      n.children ?? [],
      n.kind === "entry" ? [...trail, n.name] : trail,
      path,
    );
  });

// The container whose children are the alternative model entries. Only the
// group shapes have alternatives; a bare top-level model entry (Daemonettes)
// has none, so there is nothing to cap.
const poolGroupOf = (nodes: OptionNode[]): OptionNode | null =>
  nodes.find(
    (n) =>
      n.kind === "group" &&
      (isModel(n) || (n.children ?? []).some((c) => isModel(c))),
  ) ?? null;

// Per-weapon limits ("max 2 blastmasters"), keyed by lowercased weapon name.
// The cap lives on the model that carries the weapon -- "Noise Marine w/
// blastmaster {max=2}" -- so it only transfers to the weapon when that model is
// the weapon's ONLY carrier. Close combat weapon hangs off every entry in the
// squad and is not limited by any of them.
const capsOf = (nodes: OptionNode[]): Record<string, number> => {
  const group = poolGroupOf(nodes);
  if (!group) return {};

  const size =
    isModel(group) && group.max != null
      ? group.max
      : ((group.children ?? []).find(isModel)?.max ?? 0);

  const carriers = new Map<string, OptionNode[]>();

  for (const entry of (group.children ?? []).filter(
    (c) => c.kind === "entry",
  )) {
    // Skip nested groups: a choice ("Ranged weapon") is not a weapon, and
    // naming one would put a cap on a nonexistent row.
    for (const weapon of (entry.children ?? []).filter(
      (c) => c.kind !== "group",
    )) {
      const key = weapon.name.toLowerCase();
      carriers.set(key, [...(carriers.get(key) ?? []), entry]);
    }
  }

  const caps: Record<string, number> = {};

  for (const [key, owners] of Array.from(carriers)) {
    if (owners.length !== 1) continue;
    const cap = owners[0].max;
    // A cap equal to the squad size is not a limit -- every model could carry it.
    if (cap == null || cap >= size) continue;
    caps[key] = cap;
  }

  return caps;
};

// Pool + champions, so the rows add up to the cost line's model count -- a
// squad reads as "5 Noise Marines + 1 Disharmonist = 6", not an unexplained 6.
const compositionOf = (
  nodes: OptionNode[],
): { name: string; count: string }[] => {
  const pool = poolOf(nodes);
  if (!pool) return [];

  return [
    {
      name: pool.name,
      count:
        pool.min != null && pool.max != null && pool.min !== pool.max
          ? `${pool.min}-${pool.max}`
          : String(pool.max ?? pool.min ?? "?"),
    },
    ...championsOf(nodes).map((name) => ({ name, count: "1" })),
  ];
};

const LoadoutModal: React.FC<{
  datasheetId: string;
  selfUid: string;
  unitName: string;
  costLabel: string | null;
  picks: WargearPick[];
  isLeader: boolean;
  targets: AttachTarget[];
  attachedToUid: string | null;
  hasEnhancements: boolean;
  detachmentId: string | null;
  // Enhancement ids already spent elsewhere in this army: each may be given to
  // only one model.
  spentEnhancements: string[];
  enhancementId: string | null;
  onSave: (next: {
    picks: WargearPick[];
    attachedToUid: string | null;
    // The whole thing, not just the id: the roster snapshots its name and
    // points and would otherwise have to re-fetch to learn them.
    enhancement: Enhancement | null;
  }) => void;
  onClose: () => void;
}> = ({
  datasheetId,
  selfUid,
  unitName,
  costLabel,
  picks,
  isLeader,
  targets,
  attachedToUid,
  hasEnhancements,
  detachmentId,
  spentEnhancements,
  enhancementId,
  onSave,
  onClose,
}) => {
  const [sheet, setSheet] = useState<Datasheet | null>(null);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [leads, setLeads] = useState<string[] | null>(null);
  const [enhancements, setEnhancements] = useState<Enhancement[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [attached, setAttached] = useState<string | null>(attachedToUid);
  const [enhancement, setEnhancement] = useState<string | null>(enhancementId);

  useEffect(() => {
    let live = true;

    fetch(`${API}/datasheets/single/${datasheetId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: Datasheet) => live && setSheet(j))
      .catch(() => live && setFailed(true));

    // Separate call: the weapons table is worth showing even if it is slower,
    // and a failure here must not blank the choices.
    fetch(`${API}/datasheets-wargear/${datasheetId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: Weapon[]) => live && setWeapons(j))
      .catch(() => live && setWeapons([]));

    // Also when it can take enhancements: one might grant an attachment even to
    // a character with no base pairings, and the grant is unioned onto `leads`.
    if (isLeader || hasEnhancements) {
      fetch(`${API}/datasheets-leader/${datasheetId}/leads`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: { id: string }[]) => live && setLeads(j.map((x) => x.id)))
        .catch(() => live && setLeads([]));
    }

    if (hasEnhancements) {
      fetch(`${API}/datasheets-enhancements/${datasheetId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: Enhancement[]) => live && setEnhancements(j))
        .catch(() => live && setEnhancements([]));
    }

    return () => {
      live = false;
    };
  }, [datasheetId, isLeader, hasEnhancements]);

  // Enhancements belong to a detachment, so only the selected one's are
  // offered; one already given to another model is withheld.
  const offered = useMemo(
    () =>
      (enhancements ?? []).filter(
        (e) =>
          e.detachmentId === detachmentId &&
          (e.id === enhancementId || !spentEnhancements.includes(e.id)),
      ),
    [enhancements, detachmentId, enhancementId, spentEnhancements],
  );

  // The base pairings plus anything the selected enhancement grants.
  const leadable = useMemo(() => {
    const set = new Set(leads ?? []);
    const grant = offered.find((e) => e.id === enhancement)?.grantsAttachmentTo;
    grant?.forEach((id) => set.add(id));
    return set;
  }, [leads, offered, enhancement]);

  // Which units in this roster this leader may actually join. The API rejects
  // an illegal pairing anyway; this stops one being offered.
  //
  // A squad another character already leads is withheld: a unit takes one
  // Character, and two leaders silently sharing a squad is worse than making
  // the user detach first. Its own current target is of course still offered.
  const legal = useMemo(
    () =>
      leads == null ? [] : targets.filter((t) => leadable.has(t.datasheetId)),
    [leads, targets, leadable],
  );

  const attachable = useMemo(
    () => legal.filter((t) => t.ledBy == null || t.ledBy === selfUid),
    [legal, selfUid],
  );

  const taken = useMemo(
    () => legal.filter((t) => t.ledBy != null && t.ledBy !== selfUid),
    [legal, selfUid],
  );

  const caps = useMemo(
    () => capsOf(sheet?.wargearOptions?.children ?? []),
    [sheet],
  );

  const ranged = useMemo(
    () =>
      groupWeapons(
        weapons.filter((w) => w.type !== "Melee"),
        caps,
      ),
    [weapons, caps],
  );

  const melee = useMemo(
    () =>
      groupWeapons(
        weapons.filter((w) => w.type === "Melee"),
        caps,
      ),
    [weapons, caps],
  );

  const choices = useMemo(
    () => collectChoices(sheet?.wargearOptions?.children ?? []),
    [sheet],
  );

  const composition = useMemo(
    () => compositionOf(sheet?.wargearOptions?.children ?? []),
    [sheet],
  );

  // Seeded once the tree lands: a saved pick whose group name no longer matches
  // the tree at that path is dropped rather than trusted.
  useEffect(() => {
    if (!choices.length) return;

    const byPath = new Map(choices.map((c) => [c.path, c]));
    const seed: Record<string, string> = {};

    for (const p of picks) {
      const c = byPath.get(p.path);
      if (c && c.group === p.group && c.options.includes(p.chosen)) {
        seed[p.path] = p.chosen;
      }
    }

    setChosen(seed);
    // Keyed on the tree, not on picks: re-running on picks would stamp on edits.
  }, [choices]);

  const save = () => {
    onSave({
      picks: choices
        .filter((c) => chosen[c.path])
        .map((c) => ({ path: c.path, group: c.group, chosen: chosen[c.path] })),
      // A unit dropped from the roster while this was open takes the
      // attachment with it rather than saving a dangling one.
      attachedToUid: attachable.some((t) => t.uid === attached)
        ? attached
        : null,
      enhancement: offered.find((e) => e.id === enhancement) ?? null,
    });
    onClose();
  };

  const decided = choices.filter((c) => chosen[c.path]).length;

  return (
    <PickerModal
      title={unitName}
      hint={
        costLabel
          ? `${costLabel.toUpperCase()} · ${decided}/${choices.length} CHOICES SET`
          : `${decided}/${choices.length} CHOICES SET`
      }
      onClose={onClose}
    >
      {failed && (
        <div className="border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-red-400">
          COULD NOT LOAD THIS DATASHEET
        </div>
      )}

      {!sheet && !failed && (
        <div className="border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-white/35">
          LOADING…
        </div>
      )}

      {sheet && (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {(isLeader ||
              offered.some((e) => e.grantsAttachmentTo?.length)) && (
              <fieldset className="mb-5 border border-white/[0.08] p-4">
                <legend className="px-2 font-mono text-hud text-white/45">
                  ATTACHES TO
                </legend>

                {!attachable.length ? (
                  <p className="py-2 font-mono text-[11px] leading-relaxed tracking-[0.1em] text-white/35">
                    {leads == null
                      ? "LOADING…"
                      : taken.length
                        ? `ALREADY LED — ${taken.map((t) => t.name.toUpperCase()).join(", ")}. DETACH FIRST.`
                        : "NO UNIT IN THIS ROSTER CAN BE LED BY THIS CHARACTER"}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {NOT_ATTACHED.concat(attachable).map((t) => {
                      const on = (attached ?? "") === t.uid;

                      return (
                        <label
                          key={t.uid || "none"}
                          style={
                            on
                              ? {
                                  borderColor: "var(--accent)",
                                  background: accentFade(12),
                                }
                              : undefined
                          }
                          className={
                            "flex cursor-pointer items-center gap-3 border px-3 py-2 text-sm transition-colors " +
                            (on
                              ? "text-white"
                              : "border-white/10 text-white/65 hover:border-white/25 hover:bg-white/[0.03]")
                          }
                        >
                          <input
                            type="radio"
                            name="attach"
                            checked={on}
                            onChange={() => setAttached(t.uid || null)}
                            className="sr-only"
                          />
                          <span
                            style={
                              on ? { borderColor: "var(--accent)" } : undefined
                            }
                            className={
                              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border " +
                              (on ? "" : "border-white/25")
                            }
                          >
                            {on && (
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "var(--accent)" }}
                              />
                            )}
                          </span>
                          <span className="flex-1">{t.name}</span>
                          {t.costLabel && (
                            <span className="shrink-0 font-mono text-[10px] text-white/35">
                              {t.costLabel.toUpperCase()}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            )}

            {hasEnhancements && offered.length > 0 && (
              <fieldset className="mb-5 border border-white/[0.08] p-4">
                <legend className="px-2 font-mono text-hud text-white/45">
                  ENHANCEMENT — ADDS POINTS
                </legend>

                <div className="flex flex-col gap-1.5">
                  {[null, ...offered].map((e) => {
                    const on = (enhancement ?? "") === (e?.id ?? "");

                    return (
                      <label
                        key={e?.id ?? "none"}
                        style={
                          on
                            ? {
                                borderColor: "var(--accent)",
                                background: accentFade(12),
                              }
                            : undefined
                        }
                        className={
                          "flex cursor-pointer items-start gap-3 border px-3 py-2 text-sm transition-colors " +
                          (on
                            ? "text-white"
                            : "border-white/10 text-white/65 hover:border-white/25 hover:bg-white/[0.03]")
                        }
                      >
                        <input
                          type="radio"
                          name="enhancement"
                          checked={on}
                          onChange={() => setEnhancement(e?.id ?? null)}
                          className="sr-only"
                        />
                        <span
                          style={
                            on ? { borderColor: "var(--accent)" } : undefined
                          }
                          className={
                            "mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border " +
                            (on ? "" : "border-white/25")
                          }
                        >
                          {on && (
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: "var(--accent)" }}
                            />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span>{e?.name ?? "None"}</span>
                            {e && (
                              <span className="shrink-0 font-mono text-[11px] font-bold text-[color:var(--accent)]">
                                +{e.pts} PTS
                              </span>
                            )}
                          </span>
                          {e && on && (
                            <span className="mt-1 block text-xs leading-relaxed text-white/50">
                              <RichText html={e.description} />
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {!choices.length ? (
              // Suppressed when something else is on offer: a character with an
              // enhancement and no wargear should not be told it has nothing.
              !isLeader && !offered.length ? (
                <div className="border border-dashed border-white/15 p-10 text-center font-mono text-xs tracking-[0.1em] text-white/35">
                  THIS UNIT HAS NO WARGEAR CHOICES
                </div>
              ) : null
            ) : (
              <div className="flex flex-col gap-5">
                {choices.map((c) => (
                  <fieldset
                    key={c.path}
                    className="border border-white/[0.08] p-4"
                  >
                    <legend className="px-2 font-mono text-hud text-white/45">
                      {[...c.trail, c.group].join(" › ").toUpperCase()}
                    </legend>

                    <div className="flex flex-col gap-1.5">
                      {c.options.map((o) => {
                        const on = chosen[c.path] === o;

                        return (
                          <label
                            key={o}
                            style={
                              on
                                ? {
                                    borderColor: "var(--accent)",
                                    background: accentFade(12),
                                  }
                                : undefined
                            }
                            className={
                              "flex cursor-pointer items-center gap-3 border px-3 py-2 text-sm transition-colors " +
                              (on
                                ? "text-white"
                                : "border-white/10 text-white/65 hover:border-white/25 hover:bg-white/[0.03]")
                            }
                          >
                            <input
                              type="radio"
                              name={c.path}
                              checked={on}
                              onChange={() =>
                                setChosen((s) => ({ ...s, [c.path]: o }))
                              }
                              className="sr-only"
                            />
                            <span
                              style={
                                on
                                  ? { borderColor: "var(--accent)" }
                                  : undefined
                              }
                              className={
                                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border " +
                                (on ? "" : "border-white/25")
                              }
                            >
                              {on && (
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ background: "var(--accent)" }}
                                />
                              )}
                            </span>
                            {o}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-5">
            {sheet.loadout && (
              <div className="border border-white/[0.08] p-4">
                <div className="mb-2 font-mono text-hud text-white/45">
                  DEFAULT LOADOUT
                </div>
                <div className="rich text-sm leading-relaxed text-white/70">
                  <RichText html={sheet.loadout} />
                </div>
              </div>
            )}

            {composition.length > 0 && (
              <div className="border border-white/[0.08] p-4">
                <div className="mb-2 font-mono text-hud text-white/45">
                  COMPOSITION
                </div>
                {composition.map((g) => (
                  <div
                    key={g.name}
                    className="flex items-baseline justify-between gap-3 py-0.5 text-sm text-white/60"
                  >
                    <span className="truncate">{g.name}</span>
                    <span className="shrink-0 font-mono text-[11px] text-white/45">
                      {g.count}
                    </span>
                  </div>
                ))}

                {costLabel && (
                  <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-white/[0.08] pt-2">
                    <span className="font-mono text-hud text-white/45">
                      THIS LOADOUT
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-[color:var(--accent)]">
                      {costLabel}
                    </span>
                  </div>
                )}

                <p className="mt-2 font-mono text-[9px] leading-relaxed tracking-[0.08em] text-white/30">
                  SET BY THE UNIT&apos;S COMPOSITION PICKER ON THE ROSTER
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {sheet && weapons.length > 0 && (
        <div className="mt-8">
          <WeaponTable label="Ranged Weapons" rows={ranged} />
          <WeaponTable label="Melee Weapons" rows={melee} />
        </div>
      )}

      {sheet && (
        <div className="mt-8 flex items-center gap-4 border-t border-white/[0.07] pt-6">
          <button
            type="button"
            onClick={save}
            style={{ background: "var(--accent)", color: ON_ACCENT }}
            className="px-7 py-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] transition-[filter] hover:brightness-110"
          >
            Confirm Loadout
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </PickerModal>
  );
};

const Stats: React.FC<{ weapon: Weapon }> = ({ weapon }) => (
  <>
    {[weapon.range, weapon.a, weapon.bsWs, weapon.s, weapon.ap, weapon.d].map(
      (v, j) => (
        <td
          key={j}
          className="px-3 py-2 text-center font-mono text-sm text-white/70"
        >
          {j === 0 && v && v !== "Melee" ? `${v}"` : (v ?? "—")}
        </td>
      ),
    )}
  </>
);

const Abilities: React.FC<{ text: string | null }> = ({ text }) =>
  text ? (
    <div className="mt-0.5 font-mono text-[10px] text-[color:var(--accent)]">
      {text.toUpperCase()}
    </div>
  ) : null;

const Cap: React.FC<{ cap?: number }> = ({ cap }) =>
  cap == null ? null : (
    <span
      style={{ borderColor: accentFade(45) }}
      className="ml-2 shrink-0 border px-1.5 py-px font-mono text-[10px] text-[color:var(--accent)]"
      title={`This unit may take at most ${cap}`}
    >
      MAX {cap}
    </span>
  );

const WeaponTable: React.FC<{ label: string; rows: WeaponGroup[] }> = ({
  label,
  rows,
}) => {
  if (!rows.length) return null;

  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-2 font-mono text-hud text-white/45">
        {label.toUpperCase()}
      </div>

      {/* Wide content scrolls itself rather than stretching the modal. */}
      <div className="overflow-x-auto border border-white/[0.08]">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {["Weapon", "Range", "A", "BS/WS", "S", "AP", "D"].map((h) => (
                <th
                  key={h}
                  className={
                    "px-3 py-2 font-mono text-[10px] font-normal tracking-[0.1em] text-white/40 " +
                    (h === "Weapon" ? "" : "w-[9%] text-center")
                  }
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => {
              const single =
                g.profiles.length === 1 && g.profiles[0].profile === null;

              // Single-profile weapon: name and stats on one row.
              if (single) {
                const { weapon } = g.profiles[0];

                return (
                  <tr
                    key={g.base}
                    className="border-b border-white/[0.05] last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-baseline">
                        <span className="text-sm text-white/85">{g.base}</span>
                        <Cap cap={g.cap} />
                      </div>
                      <Abilities text={weapon.description} />
                    </td>
                    <Stats weapon={weapon} />
                  </tr>
                );
              }

              // Multi-profile: the weapon is named once and carries the cap;
              // its profiles are the rows beneath it.
              return (
                <React.Fragment key={g.base}>
                  <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                    <td colSpan={7} className="px-3 pb-1 pt-2">
                      <div className="flex items-baseline">
                        <span className="text-sm font-semibold text-white/85">
                          {g.base}
                        </span>
                        <Cap cap={g.cap} />
                      </div>
                    </td>
                  </tr>

                  {g.profiles.map(({ profile, weapon }, i) => (
                    <tr
                      key={`${g.base}-${profile ?? i}`}
                      className="border-b border-white/[0.05] last:border-b-0"
                    >
                      <td className="py-2 pl-7 pr-3">
                        <div className="text-sm text-white/60">
                          {profile ?? g.base}
                        </div>
                        <Abilities text={weapon.description} />
                      </td>
                      <Stats weapon={weapon} />
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoadoutModal;
