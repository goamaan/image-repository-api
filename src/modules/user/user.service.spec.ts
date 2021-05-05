import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
    closeInMongodConnection,
    rootMongooseTestModule,
} from '../../utils/MongoMemoryServer';
import { AuthModule } from '../auth/auth.module';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';

const mockCreateUserNoRole: CreateUserDto = {
    name: 'test',
    email: 'test@gmail.com',
    password: 'test123',
};

const mockCreateUserAdmin: CreateUserDto = {
    name: 'test',
    email: 'test@gmail.com',
    password: 'test123',
};

describe('UserService', () => {
    let service: UserService;
    let userModel: Model<UserDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                MongooseModule.forFeatureAsync([
                    {
                        name: 'User',
                        useFactory: () => {
                            const schema = UserSchema;
                            schema.pre<UserDocument>('save', function (next) {
                                // eslint-disable-next-line @typescript-eslint/no-this-alias
                                const user = this;
                                if (!user.isModified('password')) {
                                    next();
                                }
                                const hash = bcrypt.hashSync(user.password, 10);
                                user.password = hash;
                                next();
                            });
                            return schema;
                        },
                    },
                ]),
                AuthModule,
            ],
            providers: [UserService],
        }).compile();

        service = module.get<UserService>(UserService);
        userModel = module.get<Model<UserDocument>>('UserModel');
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await closeInMongodConnection();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should register user', async () => {
        await service.register(mockCreateUserAdmin);
        const users = await userModel.find({});
        expect(users.length).toEqual(1);
        expect(users[0].name).toEqual('test');
    });
});
