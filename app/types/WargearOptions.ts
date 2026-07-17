import type { OptionNode } from "@/app/types/OptionNode";

export interface WargearOptions {
  bsName: string;
  maxPerRoster?: number;
  children?: OptionNode[];
}
