import { createRemoteJWKSet, jwtVerify } from "jose";
import type { FastifyRequest } from "fastify";
import type { ApiConfig } from "../config.js";
import type { AuthAdapter, AuthContext, AuthRole } from "./types.js";
import { isMilEmail } from "./types.js";

function rolesFromClaims(claims: Record<string, unknown>): AuthRole[] {
  const rawRoles = Array.isArray(claims.roles) ? claims.roles : [];
  const mapped = rawRoles
    .map((role) => String(role).toLowerCase())
    .filter((role): role is AuthRole => ["viewer", "contributor", "moderator", "admin"].includes(role));

  return mapped.length > 0 ? mapped : ["contributor"];
}

export class EntraAuthAdapter implements AuthAdapter {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(config: ApiConfig) {
    if (!config.entraTenantId || !config.entraAudience) {
      throw new Error("ENTRA_TENANT_ID and ENTRA_AUDIENCE are required when AUTH_PROVIDER=entra");
    }

    this.issuer = config.entraIssuer ?? `https://login.microsoftonline.com/${config.entraTenantId}/v2.0`;
    this.audience = config.entraAudience;
    this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/discovery/v2.0/keys`));
  }

  async authenticate(request: FastifyRequest): Promise<AuthContext> {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

    if (!token) {
      return {
        authenticated: false,
        provider: "entra",
        roles: ["viewer"],
      };
    }

    const verified = await jwtVerify(token, this.jwks, {
      audience: this.audience,
      issuer: this.issuer,
    });

    const claims = verified.payload as Record<string, unknown>;
    const email = String(claims.preferred_username ?? claims.upn ?? claims.email ?? "").toLowerCase();

    return {
      authenticated: isMilEmail(email),
      provider: "entra",
      email: email || undefined,
      roles: rolesFromClaims(claims),
    };
  }
}
