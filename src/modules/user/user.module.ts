import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: 'User',
                useFactory: () => {
                    const schema = UserSchema;
                    schema.pre<UserDocument>('save', function (next) {
                        try {
                            if (!this.isModified('password')) {
                                return next();
                            }
                            const hashed = bcrypt.hashSync(this.password, 10);
                            this.password = hashed;
                        } catch (error) {
                            return next(error);
                        }
                    });
                    return schema;
                },
            },
        ]),
        AuthModule,
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
