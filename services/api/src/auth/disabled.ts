import type { FastifyRequest } from "fastify";
import type { AuthAdapter, AuthContext } from "./types.js";

export class DisabledAuthAdapter implements AuthAdapter {
  async authenticate(_request: FastifyRequest): Promise<AuthContext> {
    return {
      authenticated: false,
      provider: "disabled",
      roles: ["viewer"],
    };
  }
}
