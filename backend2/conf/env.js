import "dotenv/config";
import { z } from "zod";

const zodObject = {
  PORT: z.coerce.number().default(5000),
  ENVIRONMENT: z.enum(["development", "production", "test"]).default("development"),
  HTTP_SECURE_OPTION: z.string(),
  ACCESS_CONTROL_ORIGIN: z.string(),
  
  
  MONGODB_URI: z.string(),
}

const envSchema = z.object(zodObject);
export const env = envSchema.parse(process.env);