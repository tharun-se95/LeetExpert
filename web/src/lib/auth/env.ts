export interface OAuthPair {
  clientId: string;
  clientSecret: string;
}

export interface AuthEnv {
  baseURL: string;
  secret: string;
  github: OAuthPair;
  google: OAuthPair;
  production: boolean;
}

type Env = Record<string, string | undefined>;

/**
 * Null unless every variable is set. Local development without secrets and
 * Vercel previews (whose per-deploy URLs cannot be registered as OAuth
 * callbacks) land here and run anonymous-only, exactly as before accounts.
 * Hook-free and import-free on purpose: the root layout may reach it.
 */
export function readAuthEnv(env: Env = process.env): AuthEnv | null {
  const {
    DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  } = env;
  if (
    !DATABASE_URL || !BETTER_AUTH_SECRET || !BETTER_AUTH_URL ||
    !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET
  ) {
    return null;
  }
  return {
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
    github: { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET },
    google: { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET },
    production: env.NODE_ENV === "production",
  };
}

export function isAuthConfigured(env: Env = process.env): boolean {
  return readAuthEnv(env) !== null;
}
