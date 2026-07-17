// GET /rosters
export interface SavedRoster {
  id: string;
  name: string;
  factionId: string;
  subfactionKeyword: string | null;
  detachmentName: string | null;
  battleSize: number;
  pointsAtSave: number | null;
  updatedAt: string;
  deletedAt: string | null;
  units: { id: string }[];
}
