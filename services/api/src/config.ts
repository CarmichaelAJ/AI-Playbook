export type AuthProvider = "disabled" | "mock-mil" | "entra";

export type ApiConfig = {
  nodeEnv: string;
  host: string;
  port: number;
  corsOrigin: string;
  databaseUrl?: string;
  authProvider: AuthProvider;
  requireMilEmail: boolean;
  entraTenantId?: string;
  entraAudience?: string;
  entraIssuer?: string;
  mediaStorageDir: string;
};

function optional(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function readConfig(): ApiConfig {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const authProvider = (process.env.AUTH_PROVIDER ?? (nodeEnv === "production" ? "disabled" : "mock-mil")) as AuthProvider;

  if (!["disabled", "mock-mil", "entra"].includes(authProvider)) {
    throw new Error(`Unsupported AUTH_PROVIDER: ${authProvider}`);
  }

  return {
    nodeEnv,
    host: process.env.HOST ?? "0.0.0.0",
    port: Number(process.env.PORT ?? 8080),
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3001",
    databaseUrl: optional(process.env.DATABASE_URL),
    authProvider,
    requireMilEmail: bool(process.env.REQUIRE_MIL_EMAIL, true),
    entraTenantId: optional(process.env.ENTRA_TENANT_ID),
    entraAudience: optional(process.env.ENTRA_AUDIENCE),
    entraIssuer: optional(process.env.ENTRA_ISSUER),
    mediaStorageDir: process.env.MEDIA_STORAGE_DIR ?? ".data/media",
  };
}

export function envBool(name: string, fallback: boolean): boolean {
  return bool(process.env[name], fallback);
}
