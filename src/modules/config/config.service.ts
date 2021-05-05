import { parse } from 'dotenv';
import * as joi from 'joi';
import * as fs from 'fs';

export interface EnvConfig {
    [key: string]: string;
}

export class ConfigService {
    private readonly envConfig: EnvConfig;

    constructor(filePath = '.env') {
        const config = parse(fs.readFileSync(filePath));
        this.envConfig = ConfigService.validateInput(config);
    }

    private static validateInput(envConfig: EnvConfig): EnvConfig {
        const envVarsSchema: joi.ObjectSchema = joi.object({
            API_ENV: joi.string().valid('dev', 'prod').default('dev'),
            API_URL: joi.string().uri({
                scheme: [/https?/],
            }),
            JWT_SECRET_KEY: joi.string().required(),
            JWT_EXPIRATION_TIME: joi.string().required(),
            DB_URL: joi.string().regex(/^mongodb/),
            AWS_S3_BUCKET: joi.string().required(),
            AWS_ACCESS_KEY_ID: joi.string().required(),
            AWS_SECRET_KEY: joi.string().required(),
        });

        const { error, value: validatedEnvConfig } = envVarsSchema.validate(
            envConfig,
        );
        if (error) {
            throw new Error(`Env Config validation error - ${error.message}`);
        }
        return validatedEnvConfig;
    }

    get(key: string): string {
        return this.envConfig[key];
    }

    isEnv(env: string): boolean {
        return this.envConfig.API_ENV === env;
    }
}
