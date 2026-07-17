// `path` addresses a group in datasheets.wargearOptions; `group` is its name at
// save time, so a regenerated tree can be detected rather than mis-rendered.
export interface WargearPick {
  path: string;
  group: string;
  chosen: string;
}
