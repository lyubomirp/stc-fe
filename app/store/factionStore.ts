import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Faction {
  id: string;
  name: string;
  link?: string;
}

interface FactionStore {
  faction: Faction | null;
  /** A faction keyword (e.g. "Ultramarines"), not a faction of its own. */
  subfaction: string | null;
  setFaction: (faction: Faction | null) => void;
  setSubfaction: (subfaction: string | null) => void;
}

const useFactionStore = create<FactionStore>()(
  persist(
    (set) => ({
      faction: null,
      subfaction: null,
      // Subfactions are keywords of one faction, so a faction change always
      // invalidates them -- Ultramarines cannot survive a switch to Orks.
      setFaction: (faction) =>
        set((state) =>
          faction?.id === state.faction?.id
            ? state
            : { faction, subfaction: null },
        ),
      setSubfaction: (subfaction) => set({ subfaction }),
    }),
    { name: "faction-storage" },
  ),
);

export default useFactionStore;
