import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { AwsModule } from '../aws/aws.module';
import { AwsService } from '../aws/aws.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageSchema } from './image.schema';
import { ConfigModule } from '../config/config.module';
import { UserSchema } from '../user/user.schema';

@Module({
    imports: [
        AwsModule,
        ConfigModule,
        MongooseModule.forFeature([
            {
                name: 'Image',
                schema: ImageSchema,
            },
            {
                name: 'User',
                schema: UserSchema,
            },
        ]),
    ],
    providers: [ImageService, AwsService],
    controllers: [ImageController],
})
export class ImageModule {}
