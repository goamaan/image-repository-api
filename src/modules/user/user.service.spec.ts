import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
    closeInMongodConnection,
    rootMongooseTestModule,
} from '../../utils/MongoMemoryServer';
import { AuthModule } from '../auth/auth.module';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let userModel: Model<UserDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                MongooseModule.forFeature([
                    {
                        name: 'User',
                        schema: UserSchema,
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

    /*
        REGISTER TESTS
    */
    const mockCreateUserNoRole: CreateUserDto = {
        name: 'test',
        email: 'test@gmail.com',
        password: 'test123',
    };

    const mockCreateUserAdmin: CreateUserDto = {
        name: 'test',
        email: 'test@gmail.com',
        password: 'test123',
        roles: ['ADMIN'],
    };

    const mockCreateUserError: CreateUserDto = {
        name: 'test',
        email: 'test.com',
        password: 'test123',
        roles: ['ADMIN'],
    };

    it('should register user with admin role', async () => {
        const response = await service.register(mockCreateUserAdmin);
        const users = await userModel.find({});
        expect(users.length).toEqual(1);
        expect(users[0].name).toEqual('test');
        expect(users[0].roles).toContain('ADMIN');
        expect(users[0].roles).toHaveLength(1);
        expect(response.accessToken).toBeDefined();
    });

    it('should register user w/o roles', async () => {
        const response = await service.register(mockCreateUserNoRole);
        const users = await userModel.find({});
        expect(users.length).toEqual(1);
        expect(users[0].name).toEqual('test');
        expect(users[0].roles).toContain('USER');
        expect(users[0].roles).toHaveLength(1);
        expect(response.accessToken).toBeDefined();
    });

    it('should not register user if validation error', async () => {
        expect(
            service.register(mockCreateUserError),
        ).rejects.toThrowErrorMatchingSnapshot();
        const users = await userModel.find({});
        expect(users.length).toEqual(0);
    });

    it('should not register user if already exists', async () => {
        await service.register(mockCreateUserAdmin);
        expect(service.register(mockCreateUserAdmin)).rejects.toThrowError(
            new BadRequestException('Email must be unique.'),
        );
        const users = await userModel.find({});
        expect(users.length).toEqual(1);
    });

    /*
        LOGIN TESTS
    */
    const mockLoginUserValid: LoginUserDto = {
        email: 'test@gmail.com',
        password: 'test123',
    };

    const mockLoginUserInvalid: LoginUserDto = {
        email: 'invalid@gmail.com',
        password: 'test123',
    };

    it('should login user with correct creds', async () => {
        await service.register(mockCreateUserNoRole);
        const response = await service.login(mockLoginUserValid);
        expect(response.accessToken).toBeDefined();
    });

    it('should reject user with incorrect creds', async () => {
        await service.register(mockCreateUserNoRole);
        expect(service.login(mockLoginUserInvalid)).rejects.toThrowError(
            new NotFoundException('Wrong email or password.'),
        );
    });

    /*
        GET TESTS
    */
    it('should fetch user with id', async () => {
        const res = await service.register(mockCreateUserNoRole);
        const response = await service.get(res.id);
        expect(response).toHaveProperty('name');
        expect(response).toHaveProperty('id');
    });

    it('should fetch user with email', async () => {
        const res = await service.register(mockCreateUserNoRole);
        const response = await service.get(res.id);
        expect(response).toHaveProperty('name');
        expect(response).toHaveProperty('id');
    });
});
