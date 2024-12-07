export const NODEINFO = "NODEINFO";
export const SENDWORK = "SENDWORK";

export type requiredNode = {
  method: typeof NODEINFO;
  numberOfRequiredNodes: number;
  sizesOfNodes: NodeSizes[];
};

export type sendWork = {
  method: typeof SENDWORK;
  processId: string;
  work: { size: NodeSizes; layer: string }[];
};

export enum NodeSizes {
  "SMALL" = 1,
  "MID" = 2,
  "LARGE" = 3,
}

export type EngineMessage = requiredNode | sendWork;
