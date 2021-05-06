import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { AwsModule } from '../aws/aws.module';
import { AwsService } from '../aws/aws.service';

@Module({
    imports: [AwsModule],
    providers: [ImageService, AwsService],
    controllers: [ImageController],
})
export class ImageModule {}
