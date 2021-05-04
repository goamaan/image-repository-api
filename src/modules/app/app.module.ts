import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './app.roles';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                ({
                    uri: configService.get('DB_URL'),
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                } as MongooseModuleAsyncOptions),
        }),
        AccessControlModule.forRoles(roles),
        ConfigModule,
        AuthModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
