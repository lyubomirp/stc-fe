// GET /datasheets-enhancements/:id
export interface Enhancement {
  id: string;
  name: string;
  pts: number;
  detachment: string;
  detachmentId: string | null;
  description: string;
  // Datasheet ids this enhancement lets its bearer lead beyond the base pairings.
  grantsAttachmentTo?: string[];
}
