import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { UserSchema } from '../user/user.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                return {
                    secret: configService.get('JWT_SECRET_KEY'),
                    signOptions: {
                        ...(configService.get('JWT_EXPIRATION_TIME')
                            ? {
                                  expiresIn: configService.get(
                                      'JWT_EXPIRATION_TIME',
                                  ),
                              }
                            : {}),
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy],
    exports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthService],
})
export class AuthModule {}
