import dotenv from "dotenv";

dotenv.config();

interface Env {
  // Core Application
  NODE_ENV: string;

  // Storage
  DATABASE_URL: string;

  // Authentication & Security
  ENCRYPTION_KEY: string;
  ALLOWED_IPS: string[];
  ALLOWED_DOMAINS: string[];

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_STRICT_WINDOW_MS: number;
  RATE_LIMIT_STRICT_MAX_REQUESTS: number;

  // OpenTelemetry
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;
}

function validateRequiredEnvVar(
  name: string,
  value: string | undefined
): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
        `   This variable is essential for the application to function properly.\n` +
        `   Please set ${name} in your environment configuration.`
    );
  }
  return value;
}

function validateOptionalEnvVar(
  name: string,
  value: string | undefined,
  defaultValue: string = ""
): string {
  return value || defaultValue;
}

function validateOptionalArrayEnvVar(
  name: string,
  value: string | undefined
): string[] {
  return value ? value.split(",").map((item) => item.trim()) : [];
}

function validateOptionalNumberEnvVar(
  name: string,
  value: string | undefined,
  defaultValue: number
): number {
  if (!value) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    console.warn(
      `⚠️  Invalid value for ${name}: "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }
  return parsed;
}

function getEnv(): Env {
  // Validate required environment variables
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  };

  // Check all required variables at once for better error reporting
  const missingVars: string[] = [];
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === "") {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missingVars.join(", ")}\n` +
        `   These variables are essential for the application to function properly.\n` +
        `   Please set the following environment variables:\n` +
        missingVars.map((varName) => `   - ${varName}`).join("\n")
    );
  }

  return {
    // Core Application
    NODE_ENV: validateOptionalEnvVar(
      "NODE_ENV",
      process.env.NODE_ENV,
      "development"
    ),

    // Storage
    DATABASE_URL: validateRequiredEnvVar(
      "DATABASE_URL",
      process.env.DATABASE_URL
    ),

    // Authentication & Security
    ALLOWED_IPS: validateOptionalArrayEnvVar(
      "ALLOWED_IPS",
      process.env.ALLOWED_IPS
    ),
    ALLOWED_DOMAINS: validateOptionalArrayEnvVar(
      "ALLOWED_DOMAINS",
      process.env.ALLOWED_DOMAINS
    ),
    ENCRYPTION_KEY: validateRequiredEnvVar(
      "ENCRYPTION_KEY",
      process.env.ENCRYPTION_KEY
    ),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: validateOptionalNumberEnvVar(
      "RATE_LIMIT_WINDOW_MS",
      process.env.RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000 // 15 minutes default
    ),
    RATE_LIMIT_MAX_REQUESTS: validateOptionalNumberEnvVar(
      "RATE_LIMIT_MAX_REQUESTS",
      process.env.RATE_LIMIT_MAX_REQUESTS,
      100 // 100 requests per window default
    ),
    RATE_LIMIT_STRICT_WINDOW_MS: validateOptionalNumberEnvVar(
      "RATE_LIMIT_STRICT_WINDOW_MS",
      process.env.RATE_LIMIT_STRICT_WINDOW_MS,
      60 * 1000 // 1 minute default
    ),
    RATE_LIMIT_STRICT_MAX_REQUESTS: validateOptionalNumberEnvVar(
      "RATE_LIMIT_STRICT_MAX_REQUESTS",
      process.env.RATE_LIMIT_STRICT_MAX_REQUESTS,
      10 // 10 requests per window default
    ),

    // OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  };
}

export const env = getEnv();
