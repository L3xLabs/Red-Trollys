export const HEALTH = "HEALTH";
export const STRENGTH = "STRENGTH";

export type HealthMessage = {
  method: typeof HEALTH;
  channel: string;
  ok: boolean;
};

export type StrengthMessage = {
  method: typeof STRENGTH;
  channel: string;
  strength: "LARGE" | "MID" | "SMALL";
};

export type IncomingMessage = HealthMessage | StrengthMessage;
