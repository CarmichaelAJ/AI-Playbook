import type { FastifyRequest } from "fastify";

export type AuthRole = "viewer" | "contributor" | "moderator" | "admin";

export type AuthContext = {
  authenticated: boolean;
  provider: string;
  email?: string;
  roles: AuthRole[];
};

export interface AuthAdapter {
  authenticate(request: FastifyRequest): Promise<AuthContext>;
}

export function isMilEmail(email: string | undefined): boolean {
  return Boolean(email && /^[^@\s]+@[^@\s]+\.mil$/i.test(email));
}
