export const HEALTHCHECK = "HEALTHCHECK ";
export const STRENGTHCHECK = "STRENGTHCHECK";
export const PROCESSDATA = "PROCESSDATA";

export type HealthCheckMessage = {
  method: typeof HEALTHCHECK;
  msg: string;
};

export type StrengthCheck = {
  method: typeof STRENGTHCHECK;
  msg: string;
};

export type ProcessData = {
  method: typeof PROCESSDATA;
  processId: string;
  data: {
    jsUrl: string;
    csvUrl: string;
  };
};

export type outgoingMessage = HealthCheckMessage | StrengthCheck | ProcessData;
