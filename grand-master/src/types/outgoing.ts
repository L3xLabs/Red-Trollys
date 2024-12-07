export const HEALTHCHECK = "HEALTHCHECK ";
export const STRENGTHCHECK = "STRENGTHCHECK";

export type HealthCheckMessage = {
  method: typeof HEALTHCHECK;
  msg: string;
};

export type outgoingMessage = HealthCheckMessage;
