import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Faction {
  id: string;
  name: string;
  link?: string;
}

interface FactionStore {
  faction: Faction | null;
  subfaction: string | null;
  setFaction: (faction: Faction | null) => void;
  setSubfaction: (subfaction: string | null) => void;
}

const useFactionStore = create<FactionStore>()(
  persist(
    (set) => ({
      faction: null,
      subfaction: null,
      // A sub-faction is a keyword of one faction, so a change invalidates it.
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
