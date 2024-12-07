export const HEALTH = "HEALTH";
export const STRENGTH = "STRENGTH";

export type HealthMessage = {
  method: typeof HEALTH;
  ok: boolean;
};

export type StrengthMessage = {
  method: typeof STRENGTH;
  strength: "LARGE" | "MID" | "SMALL";
};

export type IncomingMessage = HealthMessage | StrengthMessage;
