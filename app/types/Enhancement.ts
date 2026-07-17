// GET /datasheets-enhancements/:id
export interface Enhancement {
  id: string;
  name: string;
  pts: number;
  detachment: string;
  detachmentId: string | null;
  description: string;
}
