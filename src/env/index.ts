import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]).default("production"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
});

const _env = envSchema.safeParse(process.env);

export const env = _env.data;
