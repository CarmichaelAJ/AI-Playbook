import type { ApiConfig } from "../config.js";
import { DisabledAuthAdapter } from "./disabled.js";
import { EntraAuthAdapter } from "./entra.js";
import { MockMilAuthAdapter } from "./mockMil.js";
import type { AuthAdapter } from "./types.js";

export function createAuthAdapter(config: ApiConfig): AuthAdapter {
  if (config.authProvider === "mock-mil") return new MockMilAuthAdapter();
  if (config.authProvider === "entra") return new EntraAuthAdapter(config);
  return new DisabledAuthAdapter();
}

export { isMilEmail } from "./types.js";
export type { AuthContext, AuthRole } from "./types.js";
