import { ImageService } from './image.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
    closeInMongodConnection,
    rootMongooseTestModule,
} from '../../utils/MongoMemoryServer';
import { AwsModule } from '../aws/aws.module';
import { AwsService } from '../aws/aws.service';
import { ImageDocument, ImageSchema } from './image.schema';
import { UserDocument, UserSchema } from '../user/user.schema';
import { ConfigModule } from '../config/config.module';
import { RequestWithUser } from 'src/utils/RequestWithUser';
import { UpdateImageDto } from './dto/update-image.dto';
import * as mongoose from 'mongoose';

describe('UserService', () => {
    let service: ImageService;
    let imageModel: Model<ImageDocument>;
    let userModel: Model<UserDocument>;

    const mockRequest = {
        user: {
            email: 'test@test.com',
            userId: '609443f8c88073579a600a49',
        },
    };

    const mockData = {
        user: {
            _id: '609443f8c88073579a600a49',
            images: [],
            roles: ['USER'],
            email: 'test@test.com',
            name: 'test',
            password:
                '$2a$10$UZHoHEcVA926JAOYXMBQN.GjXJjUhDheMkQrXDYkf.T2GaSs5S7Wa',
        },
        image: {
            _id: '60944aa9b5315a60c8e5d7f8',
            url:
                'https://image-repository-api.s3.ca-central-1.amazonaws.com/user-images/609443f8c88073579a600a49-2021-05-06T19%3A59%3A16.738Z-me_in_capilano.jpg',
            name: 'me_in_capilano.jpg',
            key:
                'user-images/609443f8c88073579a600a49-2021-05-06T19:59:16.738Z-me_in_capilano.jpg',
            owner: '609443f8c88073579a600a49',
            tag: 'amaan',
            isPublic: 'true',
        },
    };

    const mockUpdate: UpdateImageDto = {
        isPublic: false,
        tag: 'newAmaan',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule({ useFindAndModify: false }),
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
            providers: [ImageService, AwsService],
        }).compile();

        service = module.get<ImageService>(ImageService);
        imageModel = module.get<Model<ImageDocument>>('ImageModel');
        userModel = module.get<Model<UserDocument>>('UserModel');
        await userModel.create(mockData.user);
        await imageModel.create(mockData.image);
    });

    afterEach(async () => {
        await imageModel.deleteMany({});
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await closeInMongodConnection();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should update one image', () => {
        expect(
            service.updateOne(
                mockRequest as RequestWithUser,
                mockData.image._id,
                mockUpdate,
            ),
        ).resolves.toEqual({
            updatedImage: {
                _id: '60944aa9b5315a60c8e5d7f8',
                url:
                    'https://image-repository-api.s3.ca-central-1.amazonaws.com/user-images/609443f8c88073579a600a49-2021-05-06T19%3A59%3A16.738Z-me_in_capilano.jpg',
                name: 'me_in_capilano.jpg',
                key:
                    'user-images/609443f8c88073579a600a49-2021-05-06T19:59:16.738Z-me_in_capilano.jpg',
                owner: '609443f8c88073579a600a49',
                tag: 'newAmaan',
                isPublic: 'false',
            },
        });
    });
});
