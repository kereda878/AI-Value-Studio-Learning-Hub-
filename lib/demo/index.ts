export * from "./data";

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export const DEMO_SESSION_COOKIE = "demo_session";
export const DEMO_SESSION_VALUE = "authenticated";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_EMAIL = "demo@genpact.com";
