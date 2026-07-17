export interface DetachmentRef {
  id: string;
  name: string;
  // Non-null marks a narrower game mode -- Boarding Actions -- which the
  // builder excludes.
  type: string | null;
}
