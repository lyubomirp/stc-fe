// A roster unit a leader could join.
export interface AttachTarget {
  uid: string;
  datasheetId: string;
  name: string;
  costLabel: string | null;
  // uid of the character already leading it, if any.
  ledBy: string | null;
}
