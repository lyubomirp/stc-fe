import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FactionStore {
  faction: any | null;
  setFaction: (faction: any) => void;
}

const useFactionStore = create<FactionStore>()(
  persist(
    (set) => ({
      faction: null,
      setFaction: (newFaction: any) =>
        set((state) => {
          if (newFaction !== state.faction) {
            return { faction: newFaction };
          }

          return { faction: state.faction };
        }),
    }),
    { name: "faction-storage" },
  ),
);

export default useFactionStore;
