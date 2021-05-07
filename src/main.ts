import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import * as headers from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as rateLimiter from 'express-rate-limit';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: console,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.use(headers());
    // in production set the cors origin to the URL of the client
    app.enableCors();
    // rate limit to max 50 requests every 5 minute
    app.use(
        rateLimiter({
            windowMs: 5 * 60000,
            max: 50,
        }),
    );
    await app.listen(3000);
}
bootstrap();
