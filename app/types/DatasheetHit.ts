// One result from /datasheets/search: enough to render a card and colour it by
// faction. The heavy prose stays on /datasheets/single/:id.
export interface DatasheetHit {
  id: string;
  name: string;
  role: string | null;
  factionId: string;
  factionName: string;
}
