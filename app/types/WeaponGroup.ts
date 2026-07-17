import type { Weapon } from "@/app/types/Weapon";

// A weapon with its profiles nested: the cap belongs to the weapon, so it
// cannot be repeated per profile.
export interface WeaponGroup {
  base: string;
  cap?: number;
  profiles: { profile: string | null; weapon: Weapon }[];
}
