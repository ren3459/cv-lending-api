import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalEnvString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);
const optionalEnvEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.email().optional(),
);
const envBoolean = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.toLowerCase() === "true";
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  SMTP_HOST: optionalEnvString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: envBoolean.default(false),
  SMTP_USER: optionalEnvString,
  SMTP_PASS: optionalEnvString,
  MAIL_FROM: optionalEnvEmail,
  MAIL_TO: optionalEnvEmail,
  AI_API_KEY: optionalEnvString,
  AI_MODEL: z.string().default("deepseek-chat"),
  AI_PROVIDER: z
    .string()
    .default("https://openrouter.ai/api/v1/chat/completions"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

const corsOrigins = parsedEnv.data.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  ...parsedEnv.data,
  CORS_ORIGINS: corsOrigins,
};
