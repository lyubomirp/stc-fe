// A node of BSData's wargear tree, in BSData's own vocabulary.
export interface OptionNode {
  kind: "group" | "entry" | "link";
  name: string;
  min?: number;
  max?: number;
  children?: OptionNode[];
}
