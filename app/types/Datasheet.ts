import type { WargearOptions } from "@/app/types/WargearOptions";

// GET /datasheets/single/:id
export interface Datasheet {
  id: string;
  name: string;
  role: string | null;
  loadout: string | null;
  wargearOptions: WargearOptions | null;
}
