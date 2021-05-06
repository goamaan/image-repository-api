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

describe('UserService', () => {
    let service: ImageService;
    let imageModel: Model<ImageDocument>;
    let userModel: Model<UserDocument>;

    const mockRequest = {
        user: {
            email: 'test@test.com',
            userId: 'fsfsfsfsg',
        },
    };

    const mockData = {
        users: [
            {
                id: '609443f8c88073579a600a49',
                name: 'test',
                email: 'test@test.com',
                accessToken:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJ1c2VySWQiOiI2MDk0NDNmOGM4ODA3MzU3OWE2MDBhNDkiLCJpYXQiOjE2MjAzMjk0NjQsImV4cCI6MTYyMDUwMjI2NH0.AquJ0AisWfSwCCvY3kDLzi9v23o_Gt9nVO6lEFp7l2w',
            },
        ],
        images: [
            {
                url:
                    'https://image-repository-api.s3.amazonaws.com/user-images/609443f8c88073579a600a49-2021-05-06T19%3A32%3A04.834Z-me_in_capilano.jpg',
                name: 'me_in_capilano.jpg',
                key:
                    'user-images/609443f8c88073579a600a49-2021-05-06T19:32:04.834Z-me_in_capilano.jpg',
                owner: '609443f8c88073579a600a49',
                tag: 'amaan',
                isPublic: 'true',
            },
        ],
    };

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
            providers: [ImageService, AwsService],
        }).compile();

        service = module.get<ImageService>(ImageService);
        imageModel = module.get<Model<ImageDocument>>('ImageModel');
        userModel = module.get<Model<UserDocument>>('UserModel');
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

    // it('should delete one image', () => {
    //     expect(service.deleteOne(mockRequest as RequestWithUser));
    // });
});
