import dotenv from "dotenv";

dotenv.config();

interface Config {
  PORT: number;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  DATABASE_SYNC: boolean;
}

// Custom error handler for environment variables
class EnvVarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Configuration Error";
  }
}

// Global error handler for environment configuration
const handleConfigError = (error: unknown) => {
  if (error instanceof EnvVarError) {
    console.error(`\x1b[31m${error.name}: ${error.message}\x1b[0m`);
  } else if (error instanceof Error) {
    console.error(`\x1b[31mConfiguration Error: ${error.message}\x1b[0m`);
  }
  process.exit(1);
};

const getEnvVariableAsNumber = (
  key: keyof Config,
  defaultValue?: number
): number => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new EnvVarError(`${key} is required but not set in environment`);
  }
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    throw new EnvVarError(`${key} must be a valid number`);
  }
  return numberValue;
};

const getEnvVariableAsString = (
  key: keyof Config,
  defaultValue?: string
): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new EnvVarError(`${key} is required but not set in environment`);
  }
  return value;
};

const getEnvVariableAsBoolean = (
  key: keyof Config,
  defaultValue?: boolean
): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new EnvVarError(`${key} is required but not set in environment`);
  }
  return value.toLowerCase() === "true";
};

let config: Config;

try {
  config = {
    PORT: getEnvVariableAsNumber("PORT", 3000),
    DATABASE_HOST: getEnvVariableAsString("DATABASE_HOST"),
    DATABASE_PORT: getEnvVariableAsNumber("DATABASE_PORT"),
    DATABASE_USER: getEnvVariableAsString("DATABASE_USER"),
    DATABASE_PASSWORD: getEnvVariableAsString("DATABASE_PASSWORD"),
    DATABASE_NAME: getEnvVariableAsString("DATABASE_NAME"),
    JWT_SECRET: getEnvVariableAsString("JWT_SECRET"),
    JWT_EXPIRATION: getEnvVariableAsString("JWT_EXPIRATION"),
    DATABASE_SYNC: getEnvVariableAsBoolean("DATABASE_SYNC", false),
  };
} catch (error) {
  handleConfigError(error);
  process.exit(1);
}

export { config };
