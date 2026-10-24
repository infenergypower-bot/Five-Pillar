import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: z.string().min(32).optional(),
  OBJECT_STORAGE_ENDPOINT: optionalUrl,
  OBJECT_STORAGE_BUCKET: z.string().optional(),
  OBJECT_STORAGE_ACCESS_KEY: z.string().optional(),
  OBJECT_STORAGE_SECRET_KEY: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
  EMAIL_PROVIDER_URL: optionalUrl,
  PAYMENT_PROVIDER_API_KEY: z.string().optional(),
  SIGNATURE_PROVIDER_API_KEY: z.string().optional(),
  ALPHI_API_URL: optionalUrl,
  ALPHI_API_KEY: z.string().optional(),
  JOB_RUNNER_SECRET: z.string().min(32).optional(),
  DEMO_MODE: z.enum(["true", "false"]).optional(),
});

export type AppEnvironment = z.infer<typeof schema>;

let cached: AppEnvironment | undefined;

export function env(): AppEnvironment {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  cached = parsed.data;
  return cached;
}

export function integrationConfigured(name: "storage" | "email" | "payment" | "signature" | "alphi"): boolean {
  const config = env();
  if (name === "storage") {
    return Boolean(config.OBJECT_STORAGE_ENDPOINT && config.OBJECT_STORAGE_BUCKET && config.OBJECT_STORAGE_ACCESS_KEY && config.OBJECT_STORAGE_SECRET_KEY);
  }
  if (name === "email") return Boolean(config.EMAIL_PROVIDER_API_KEY && config.EMAIL_PROVIDER_URL);
  if (name === "payment") return Boolean(config.PAYMENT_PROVIDER_API_KEY);
  if (name === "signature") return Boolean(config.SIGNATURE_PROVIDER_API_KEY);
  return Boolean(config.ALPHI_API_URL && config.ALPHI_API_KEY);
}
