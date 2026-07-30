import type { FastifyRequest } from "fastify";
import type { AuthAdapter, AuthContext, AuthRole } from "./types.js";
import { isMilEmail } from "./types.js";

function parseRoles(value: unknown): AuthRole[] {
  if (typeof value !== "string") return ["contributor"];
  const roles = value
    .split(",")
    .map((role) => role.trim())
    .filter((role): role is AuthRole => ["viewer", "contributor", "moderator", "admin"].includes(role));

  return roles.length > 0 ? roles : ["contributor"];
}

export class MockMilAuthAdapter implements AuthAdapter {
  async authenticate(request: FastifyRequest): Promise<AuthContext> {
    const email = request.headers["x-user-email"];
    const normalizedEmail = Array.isArray(email) ? email[0] : email;

    if (!isMilEmail(normalizedEmail)) {
      return {
        authenticated: false,
        provider: "mock-mil",
        roles: ["viewer"],
      };
    }

    return {
      authenticated: true,
      provider: "mock-mil",
      email: normalizedEmail?.toLowerCase(),
      roles: parseRoles(request.headers["x-user-roles"]),
    };
  }
}
