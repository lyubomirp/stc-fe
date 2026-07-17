// GET /datasheets-wargear/:id. One row per profile, not per weapon.
export interface Weapon {
  name: string;
  type: string | null;
  description: string | null;
  range: string | null;
  a: string;
  bsWs: string;
  s: string;
  ap: string;
  d: string;
}
