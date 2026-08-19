// GET /datasheets-abilities/:id -- a flat list in Wahapedia's print order.
// The API has already resolved the two row shapes (inline text vs a pointer at
// the shared `abilities` table), appended the parameter that makes "Deadly
// Demise" mean D3 rather than D6, and cleaned up the two type labels that were
// really page-layout hints. Nothing here needs to know any of that.
export interface DatasheetAbility {
  type: string;
  name: string;
  description: string;
}
