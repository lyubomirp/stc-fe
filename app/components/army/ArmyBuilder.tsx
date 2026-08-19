"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/app/components/TopNav";
import FactionSvgResolver from "@/app/components/FactionSvgResolver";
import RailCard from "@/app/components/army/RailCard";
import PickerModal from "@/app/components/army/PickerModal";
import FactionGrid from "@/app/components/factions/FactionGrid";
import DetachmentStep from "@/app/components/army/steps/DetachmentStep";
import RosterStep from "@/app/components/army/steps/RosterStep";
import useFactionStore, {
  Faction,
  useFactionHydrated,
} from "@/app/store/factionStore";
import { SkeletonRows } from "@/app/components/Skeleton";
import { accentColor, accentFade, ON_ACCENT } from "@/app/data/factionColors";
import { factionCode } from "@/app/data/factionMeta";
import { rosterPoints } from "@/app/data/rosterPoints";
import { detachmentSubfaction } from "@/app/data/detachmentSubfactions";
import { API, apiFetch } from "@/app/data/api";
import type { FactionOverview } from "@/app/types/FactionOverview";
import type { PendingUnit } from "@/app/types/PendingUnit";
import type { RosterItem } from "@/app/types/RosterItem";
import type { SavedUnit } from "@/app/types/SavedUnit";
import type { Step } from "@/app/types/Step";

const STEPS: { id: Step; label: string; num: string }[] = [
  { id: "detachment", label: "Detachment", num: "01" },
  { id: "roster", label: "Roster", num: "02" },
];

const ArmyBuilder: React.FC<{
  factions: Faction[];
  rosterId: string | null;
}> = ({ factions, rosterId }) => {
  const router = useRouter();
  const faction = useFactionStore((s) => s.faction);
  const subfaction = useFactionStore((s) => s.subfaction);
  const hydrated = useFactionHydrated();
  const setFaction = useFactionStore((s) => s.setFaction);
  const setSubfaction = useFactionStore((s) => s.setSubfaction);

  const [overview, setOverview] = useState<FactionOverview | null>(null);
  const [picking, setPicking] = useState<"faction" | "subfaction" | null>(null);
  // Mobile only. Above md the rail is always in flow and this is ignored.
  const [railOpen, setRailOpen] = useState(false);
  const [step, setStep] = useState<Step>("detachment");
  const [cap, setCap] = useState(2000);
  const [detachmentId, setDetachmentId] = useState<string | null>(null);

  const [rosterName, setRosterName] = useState("Untitled Roster");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Awaiting the cost tiers that arrive with RosterStep's datasheets list.
  const [pendingUnits, setPendingUnits] = useState<PendingUnit[] | null>(null);

  // A faction/sub-faction switch pending user confirmation, because it wipes
  // the build.
  const [pendingChange, setPendingChange] = useState<
    | { kind: "faction"; faction: Faction }
    | { kind: "subfaction"; keyword: string | null }
    | null
  >(null);

  // A bare /army-builder means "start a new roster", so it must open empty.
  // Everything else in the builder is local state and is already gone by the
  // time you navigate back; the persisted faction was the lone survivor, which
  // opened a "new" roster already half-configured. Editing (?roster=) is
  // exempt -- the loader below sets the faction from the saved army.
  //
  // Gated on `hydrated` because the store reads localStorage asynchronously:
  // clearing first would just be overwritten by the rehydration.
  const wipedForNew = useRef(false);

  useEffect(() => {
    if (rosterId || !hydrated || wipedForNew.current) return;

    wipedForNew.current = true;
    setFaction(null);
    setSubfaction(null);
  }, [rosterId, hydrated, setFaction, setSubfaction]);

  useEffect(() => {
    if (!railOpen) return;

    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setRailOpen(false);

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [railOpen]);

  useEffect(() => {
    if (!rosterId) return;

    let live = true;

    apiFetch(`/rosters/${rosterId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((saved) => {
        if (!live) return;

        const f = factions.find((x) => x.id === saved.factionId);
        if (f) setFaction(f);
        setSubfaction(saved.subfactionKeyword ?? null);
        setDetachmentId(saved.detachmentId ?? null);
        setCap(saved.battleSize);
        setRosterName(saved.name);
        setSavedId(saved.id);
        setDirty(false);
        setPendingUnits(
          (saved.units ?? []).map((u: SavedUnit) => ({
            id: u.id,
            datasheetId: u.datasheetId,
            costLine: u.costLine ?? null,
            modelCount: u.modelCount,
            wargear: u.wargear ?? [],
            attachedToId: u.attachedToId ?? null,
            enhancementId: u.enhancementId ?? null,
            enhancementName: u.enhancementName ?? null,
            enhancementPts: u.enhancementPts ?? null,
          })),
        );
        setStep("roster");
      })
      .catch(() => live && setSaveError("Could not load that roster"));

    return () => {
      live = false;
    };
    // Seeds the build once; re-running would stamp on edits.
  }, [rosterId]);

  useEffect(() => {
    if (!faction) {
      setOverview(null);
      return;
    }

    let live = true;
    setOverview(null);

    fetch(`${API}/factions/${faction.id}/overview`)
      .then((r) => r.json())
      .then((j) => {
        if (live) setOverview(j);
      })
      .catch(() => {
        if (live) setOverview(null);
      });

    return () => {
      live = false;
    };
  }, [faction]);

  // A sub-faction is only offered if it owns at least one of the faction's
  // detachments -- otherwise it does not differ enough to build differently.
  // This drops keyword-derivation artefacts (Drukhari's leaked Asuryani/
  // Harlequins, SM's empty Blood Ravens and the Agents-of-the-Imperium wart).
  const subfactions = useMemo(() => {
    const owners = new Set(
      (overview?.detachments ?? [])
        .map((d) => detachmentSubfaction(d.name))
        .filter(Boolean),
    );
    return (overview?.subfactions ?? []).filter((s) => owners.has(s.keyword));
  }, [overview]);

  const rosterTotal = rosterPoints(roster);
  const pct = Math.min(100, Math.round((rosterTotal / cap) * 100));

  const detachmentName =
    overview?.detachments.find((d) => d.id === detachmentId)?.name ?? null;

  const saveRoster = async () => {
    if (!faction || !roster.length) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await apiFetch(savedId ? `/rosters/${savedId}` : `/rosters`, {
        method: savedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rosterName,
          factionId: faction.id,
          subfactionKeyword: subfaction,
          detachmentId,
          detachmentName,
          battleSize: cap,
          // The API addresses attachments by index into this array: the
          // target's row id does not exist until it has been inserted.
          units: roster.map((r) => {
            const at = r.attachedToUid
              ? roster.findIndex((x) => x.uid === r.attachedToUid)
              : -1;

            return {
              datasheetId: r.datasheetId,
              costLine: r.costLine,
              modelCount: r.modelCount,
              wargear: r.wargear.length ? r.wargear : null,
              attachedToIndex: at < 0 ? null : at,
              enhancementId: r.enhancementId,
            };
          }),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Save failed (${res.status})`);
      }

      setSavedId((await res.json()).id);
      setDirty(false);

      // Next's client Router Cache holds /rosters' payload for ~30s. The page
      // being force-dynamic does not touch that -- it is server-side only, so
      // without this a save then a nav back to My Lists shows the old points.
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // A faction/sub-faction switch invalidates the roster (unit availability),
  // the detachment (sub-faction-gated) and its enhancements, so the whole build
  // is wiped and the saved identity dropped -- the switch starts a fresh army.
  const resetBuild = () => {
    setRoster([]);
    setDetachmentId(null);
    setPendingUnits(null);
    setSavedId(null);
    setRosterName("Untitled Roster");
    setDirty(false);
    setSaveError(null);
    setStep("detachment");
  };

  const applyFaction = (f: Faction) => {
    resetBuild();
    setFaction(f);
  };

  const applySubfaction = (keyword: string | null) => {
    resetBuild();
    setSubfaction(keyword);
  };

  // Confirm before wiping a non-empty list; an empty build switches silently.
  const requestFaction = (f: Faction) => {
    if (f.id === faction?.id) return;
    if (roster.length) setPendingChange({ kind: "faction", faction: f });
    else applyFaction(f);
  };

  const requestSubfaction = (keyword: string | null) => {
    if (keyword === subfaction) return;
    if (roster.length) setPendingChange({ kind: "subfaction", keyword });
    else applySubfaction(keyword);
  };

  const accentStyle = faction
    ? ({
        "--accent": accentColor(faction.id, subfaction),
      } as React.CSSProperties)
    : undefined;

  return (
    <div
      style={accentStyle}
      className="relative h-screen overflow-hidden bg-[#08080a] text-white/90"
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={
          faction
            ? {
                backgroundImage:
                  `radial-gradient(120% 80% at 20% -10%, ${accentFade(10)}, transparent 55%), ` +
                  `radial-gradient(90% 70% at 100% 110%, ${accentFade(6)}, transparent 60%)`,
              }
            : undefined
        }
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-white/[0.07]">
          <TopNav accented={Boolean(faction)} />
        </div>

        {/* The rail's job on mobile, minus the rail: which step you are on, what
            you have spent, and a way in. Only rendered once a faction exists,
            since an empty rail has nothing worth opening. */}
        {faction && (
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-2.5 md:hidden">
            <button
              type="button"
              onClick={() => setRailOpen(true)}
              aria-expanded={railOpen}
              className="flex items-center gap-2.5 text-left"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-white/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              <span className="font-mono text-[9px] tracking-[0.15em] text-white/40">
                STEP
              </span>
              <span className="text-sm font-semibold text-white">
                {STEPS.find((s) => s.id === step)?.label}
              </span>
            </button>

            <span className="shrink-0 font-mono text-xs text-white/90">
              <span className="font-bold text-[color:var(--accent)]">
                {rosterTotal}
              </span>{" "}
              / {cap}
            </span>
          </div>
        )}

        <div className="flex min-h-0 flex-1 items-stretch">
          {/* Below md the rail is 248px of a 375px screen -- two thirds of the
              viewport for navigation, leaving no room to build in. So it goes
              off-canvas and slides in, and <main> gets the whole width. */}
          <div
            onClick={() => setRailOpen(false)}
            className={
              "fixed inset-0 z-30 bg-black/70 transition-opacity duration-200 md:hidden " +
              (railOpen ? "opacity-100" : "pointer-events-none opacity-0")
            }
            aria-hidden
          />

          <aside
            className={
              "fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col gap-1.5 " +
              "overflow-y-auto border-r border-white/[0.07] bg-[#08080a] p-5 " +
              "transition-transform duration-300 ease-out motion-reduce:transition-none " +
              "md:static md:z-auto md:translate-x-0 md:bg-transparent " +
              (railOpen ? "translate-x-0" : "-translate-x-full")
            }
          >
            <div className="mb-2 flex flex-col gap-2">
              <RailCard
                label="FACTION"
                code={faction ? factionCode(faction.id) : undefined}
                name={faction?.name}
                icon={
                  faction ? (
                    <FactionSvgResolver
                      factionId={faction.id}
                      className="h-full w-full fill-current"
                    />
                  ) : undefined
                }
                onClick={() => {
                  setPicking("faction");
                  setRailOpen(false);
                }}
              />

              {faction && subfactions.length > 1 && (
                <RailCard
                  label="SUB-FACTION"
                  code={subfaction ? "CHAPTER / CRAFTWORLD" : undefined}
                  name={subfaction ?? undefined}
                  onClick={() => {
                    setPicking("subfaction");
                    setRailOpen(false);
                  }}
                />
              )}
            </div>

            {faction && (
              <>
                <div className="px-2 pb-2 pt-2 font-mono text-hud text-white/40">
                  BUILD STEPS
                </div>

                {STEPS.map((s) => {
                  const active = s.id === step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setStep(s.id);
                        setRailOpen(false);
                      }}
                      style={{
                        borderLeftColor: active
                          ? "var(--accent)"
                          : "transparent",
                        backgroundImage: active
                          ? `linear-gradient(90deg, ${accentFade(12)}, transparent)`
                          : undefined,
                      }}
                      className={
                        "flex w-full items-center gap-2.5 border-l-2 px-2 py-2.5 text-left transition-colors " +
                        (active
                          ? "text-white"
                          : "text-white/60 hover:bg-white/[0.03] hover:text-white/90")
                      }
                    >
                      <span
                        className={
                          "w-5 font-mono text-[11px] " +
                          (active
                            ? "text-[color:var(--accent)]"
                            : "text-white/40")
                        }
                      >
                        {s.num}
                      </span>
                      <span className="text-sm font-semibold">{s.label}</span>
                    </button>
                  );
                })}

                <div className="flex-1" />

                <div className="mb-3 border border-white/[0.08] p-3">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-white/45">
                      POINTS
                    </span>
                    <span className="font-mono text-xs text-white/90">
                      <span className="font-bold text-[color:var(--accent)]">
                        {rosterTotal}
                      </span>{" "}
                      / {cap}
                    </span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden bg-white/[0.06]">
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: `${pct}%`,
                        background: "var(--accent)",
                        boxShadow: `0 0 10px ${accentFade(60)}`,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveRoster}
                  disabled={!roster.length || saving}
                  style={
                    roster.length && !saving
                      ? { background: "var(--accent)", color: ON_ACCENT }
                      : undefined
                  }
                  className={
                    "w-full p-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] transition-[filter] " +
                    (roster.length && !saving
                      ? "hover:brightness-110"
                      : "cursor-not-allowed border border-white/10 text-white/25")
                  }
                >
                  {saving ? "Saving…" : "Save Army"}
                </button>
              </>
            )}
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-16 pt-5 sm:px-10 sm:pt-8">
            {!hydrated ? (
              /* The persisted faction has not been read yet, so we do not know
                 whether this is a returning user or a first visit. Showing
                 either answer here would be a guess that flips a frame later. */
              <SkeletonRows rows={10} />
            ) : !faction ? (
              <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <h1 className="font-amsterdam text-5xl italic text-white">
                  No Faction Selected
                </h1>
                <p className="max-w-md text-sm text-white/50">
                  Pick a faction to begin. Everything on this screen — the
                  detachments, the arsenal and the accent colour — follows from
                  it.
                </p>
                <button
                  type="button"
                  onClick={() => setPicking("faction")}
                  className="mt-2 border border-white/25 px-6 py-3 font-amsterdam text-[15px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  Select Faction
                </button>
              </div>
            ) : step === "detachment" ? (
              <DetachmentStep
                faction={faction}
                subfaction={subfaction}
                detachments={overview?.detachments ?? []}
                abilities={overview?.abilities ?? []}
                unitCount={
                  overview?.keywords?.find((k) => k.isFactionKeyword)?.units
                }
                cap={cap}
                onCap={setCap}
                selected={detachmentId}
                onSelect={(id) => {
                  // Enhancements belong to a detachment, so switching one makes
                  // every pick illegal. The API would reject the save anyway;
                  // this stops the points meter lying in the meantime.
                  if (id !== detachmentId) {
                    setRoster((r) =>
                      r.map((u) =>
                        u.enhancementId
                          ? {
                              ...u,
                              enhancementId: null,
                              enhancementName: null,
                              enhancementPts: null,
                            }
                          : u,
                      ),
                    );
                  }

                  setDetachmentId(id);
                }}
                onContinue={() => setStep("roster")}
              />
            ) : (
              <RosterStep
                faction={faction}
                subfaction={subfaction}
                detachmentName={detachmentName}
                detachmentId={detachmentId}
                cap={cap}
                name={rosterName}
                onName={(n) => {
                  setRosterName(n);
                  setDirty(true);
                }}
                roster={roster}
                onRoster={(r) => {
                  setRoster(r);
                  setDirty(true);
                }}
                pendingUnits={pendingUnits}
                onHydrated={(r) => {
                  setRoster(r);
                  setPendingUnits(null);
                  setDirty(false);
                }}
                onSave={saveRoster}
                saving={saving}
                savedId={savedId}
                dirty={dirty}
                saveError={saveError}
              />
            )}
          </main>
        </div>
      </div>

      {picking === "faction" && (
        <PickerModal
          title="Select Faction"
          hint="ACCESS LEVEL: STRATEGIC"
          onClose={() => setPicking(null)}
        >
          <FactionGrid
            factions={factions}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            onSelect={(f) => {
              setPicking(null);
              requestFaction(f);
            }}
          />
        </PickerModal>
      )}

      {picking === "subfaction" && (
        <PickerModal
          title="Select Sub-faction"
          hint={`${subfactions.length} AVAILABLE`}
          onClose={() => setPicking(null)}
        >
          <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {subfactions.map((s) => (
              <button
                key={s.keyword}
                type="button"
                onClick={() => {
                  setPicking(null);
                  requestSubfaction(s.keyword);
                }}
                className="group flex items-baseline justify-between bg-white/[0.02] p-5 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-amsterdam text-card font-bold text-white transition-colors group-hover:text-[color:var(--accent)]">
                  {s.keyword}
                </span>
                <span className="font-mono text-hud text-white/40">
                  {s.datasheets}
                </span>
              </button>
            ))}
          </div>

          {subfaction && (
            <button
              type="button"
              onClick={() => {
                setPicking(null);
                requestSubfaction(null);
              }}
              className="mt-4 text-hud text-white/40 transition-colors hover:text-white"
            >
              CLEAR SELECTION
            </button>
          )}
        </PickerModal>
      )}

      {pendingChange && (
        <PickerModal
          title="Discard your list?"
          hint="THIS CANNOT BE UNDONE"
          onClose={() => setPendingChange(null)}
        >
          <div className="max-w-md">
            <p className="text-sm leading-relaxed text-white/70">
              Switching{" "}
              {pendingChange.kind === "faction" ? "faction" : "sub-faction"}{" "}
              clears the current roster, detachment and enhancements. Your{" "}
              <span className="font-bold text-white">{rosterTotal}-point</span>{" "}
              list will be lost.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingChange(null)}
                className="border border-white/20 px-5 py-2.5 font-amsterdam text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/5"
              >
                Keep Building
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingChange.kind === "faction")
                    applyFaction(pendingChange.faction);
                  else applySubfaction(pendingChange.keyword);
                  setPendingChange(null);
                }}
                style={{ background: "var(--accent)", color: ON_ACCENT }}
                className="px-5 py-2.5 font-amsterdam text-sm font-bold uppercase tracking-[0.1em] transition-[filter] hover:brightness-110"
              >
                Discard &amp; Switch
              </button>
            </div>
          </div>
        </PickerModal>
      )}
    </div>
  );
};

export default ArmyBuilder;
