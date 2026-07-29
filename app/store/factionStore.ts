import { useEffect, useState } from "react";
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

// The store is persisted, so the server renders `faction: null` and the real
// faction only appears once localStorage is read on the client. Without this,
// a returning user gets a full-size "No Faction Selected" heading and a white
// --accent for one frame, then a hard swap into their actual army.
//
// Gate on this rather than on `faction` being null: the two are different
// questions, and "not chosen yet" must stay distinguishable from "not read yet"
// or a genuinely empty store would show a skeleton forever.
export const useFactionHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Rehydration can finish before this effect runs, in which case the
    // subscription below would never fire.
    if (useFactionStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useFactionStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
};

export default useFactionStore;
