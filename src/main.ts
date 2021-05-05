import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import * as headers from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: console,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.use(headers());
    await app.listen(3000);
}
bootstrap();
