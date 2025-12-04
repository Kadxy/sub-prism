import * as dotenv from "dotenv";

dotenv.config();

// Define required environment variables
const REQUIRED_KEYS = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_DOMAIN",
    "FILENAME_SALT",
] as const;

// Type definition derived from keys
type EnvConfig = Record<typeof REQUIRED_KEYS[number], string>;

function validateEnv(): EnvConfig {
    const missingKeys: string[] = [];
    const config = {} as EnvConfig;

    for (const key of REQUIRED_KEYS) {
        const value = process.env[key];
        if (!value) {
            missingKeys.push(key);
        } else {
            // Safe assignment
            config[key as keyof EnvConfig] = value;
        }
    }

    if (missingKeys.length > 0) {
        console.error(`\n❌ CRITICAL ERROR: Missing environment variables in .env`);
        console.error(`   Missing: ${missingKeys.join(", ")}`);
        console.error(`   Please check your .env file configuration.\n`);
        process.exit(1);
    }

    return config;
}

// Export validated, typed configuration (Read-only)
export const ENV = Object.freeze(validateEnv());