// One exclusive BSData group, flattened to a radio set. `trail` carries the
// enclosing entry names so "Obsessionist > Pistol" stays distinguishable.
export interface Choice {
  path: string;
  group: string;
  trail: string[];
  options: string[];
}
