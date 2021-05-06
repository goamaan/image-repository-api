import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { rootMongooseTestModule } from '../../utils/MongoMemoryServer';
import { AwsModule } from '../aws/aws.module';
import { ConfigModule } from '../config/config.module';
import { UserSchema } from '../user/user.schema';
import { ImageController } from './image.controller';
import { ImageSchema } from './image.schema';
import { ImageService } from './image.service';

describe('ImageController', () => {
    let controller: ImageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
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
                AwsModule,
                ConfigModule,
            ],
            controllers: [ImageController],
            providers: [ImageService],
        }).compile();

        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
