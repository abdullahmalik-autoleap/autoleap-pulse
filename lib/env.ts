function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to .env.local or your Vercel project settings.`
    );
  }
  return val;
}

export const env = {
  get groqApiKey() {
    return requireEnv("GROQ_API_KEY");
  },
  get nextAuthSecret() {
    return requireEnv("NEXTAUTH_SECRET");
  },
  get databaseUrl() {
    return requireEnv("DATABASE_URL");
  },
};
