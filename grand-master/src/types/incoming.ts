export const HEALTH = "HEALTH";
export const STRENGTH = "STRENGTH";
export const NODEDATA = "NODEDATA";

export type HealthMessage = {
  method: typeof HEALTH;
  ok: boolean;
};

export type StrengthMessage = {
  method: typeof STRENGTH;
  strength: "LARGE" | "MID" | "SMALL";
};

export type NodeData = {
  method: typeof NODEDATA;
  processId: string;
  data: {};
};

export type IncomingMessage = HealthMessage | StrengthMessage | NodeData;
