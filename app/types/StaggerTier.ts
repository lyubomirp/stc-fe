// One price within a staggered unit's higher (surcharge) bracket. Unlike a
// CostTier this carries no `line`: the MFM keys the surcharge by model count
// only, and the base tier's line stays the unit's identity.
export interface StaggerTier {
  models: number;
  pts: number;
}
