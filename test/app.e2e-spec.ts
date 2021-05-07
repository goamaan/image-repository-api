import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/modules/app/app.module';
import * as mongoose from 'mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from '../src/modules/app/app.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let bearer;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                AppService,
                {
                    provide: APP_GUARD,
                    useClass: JwtAuthGuard,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.enableCors();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await Promise.all([app.close(), mongoose.disconnect()]);
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!');
    });

    it('api/v1/user/profile GET Unauthorized', () => {
        return request(app.getHttpServer())
            .get('/api/v1/user/profile')
            .set('Authorization', `Bearer ${bearer}`)
            .expect(401);
    });

    it('api/v1/user/register GET invalid', () => {
        return request(app.getHttpServer())
            .get('/api/v1/user/register')
            .expect(404)
            .expect({
                statusCode: 404,
                message: 'Cannot GET /api/v1/user/register',
                error: 'Not Found',
            });
    });

    it('api/v1/user/login GET invalid', () => {
        return request(app.getHttpServer())
            .get('/api/v1/user/login')
            .expect(404)
            .expect({
                statusCode: 404,
                message: 'Cannot GET /api/v1/user/login',
                error: 'Not Found',
            });
    });

    it('api/v1/user/register POST validation error', () => {
        return request(app.getHttpServer())
            .post('/api/v1/user/register')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(400)
            .expect({
                statusCode: 400,
                message: [
                    'name should not be empty',
                    'name must contain only letters and numbers',
                ],
                error: 'Bad Request',
            });
    });

    it('api/v1/user/login POST validation error', () => {
        return request(app.getHttpServer())
            .post('/api/v1/user/login')
            .send({
                email: 'test',
                password: 'password',
            })
            .expect(400)
            .expect({
                statusCode: 400,
                message: ['email must be an email'],
                error: 'Bad Request',
            });
    });

    it('api/v1/user/login POST try to login with unregistered account', () => {
        return request(app.getHttpServer())
            .post('/api/v1/user/login')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(404)
            .expect({
                statusCode: 404,
                message: 'Wrong email or password.',
                error: 'Not Found',
            });
    });

    it('api/v1/user/register POST register regular account', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/user/register')
            .send({
                email: 'test@test.com',
                password: 'password',
                name: 'test',
            })
            .expect(201);
        return (bearer = res.body.token);
    });

    it('api/v1/user/login POST login to created account', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/user/login')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201);
        return (bearer = res.body.token);
    });

    it('api/v1/images/all GET all images Forbidden', () => {
        return request(app.getHttpServer())
            .get('/api/v1/images/all')
            .set('Authorization', `Bearer ${bearer}`)
            .expect(403)
            .expect({
                statusCode: 403,
                message: 'Forbidden',
                error: 'Forbidden',
            });
    });

    it('api/v1/user/register POST register admin account', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/user/register')
            .send({
                email: 'admin@admin.com',
                password: 'password',
                name: 'admin',
                roles: ['ADMIN'],
            })
            .expect(201);
        return (bearer = res.body.token);
    });

    it('api/v1/user/login POST login to created admin account', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/user/login')
            .send({
                email: 'admin@admin.com',
                password: 'password',
            })
            .expect(201);
        return (bearer = res.body.token);
    });

    it('api/v1/images/all GET all images success', () => {
        return request(app.getHttpServer())
            .get('/api/v1/images/all')
            .set('Authorization', `Bearer ${bearer}`)
            .expect(200)
            .expect({
                found: false,
                images: [],
            });
    });

    it('api/v1/user/register POST register admin fail due to duplicate email', () => {
        return request(app.getHttpServer())
            .post('/api/v1/user/register')
            .send({
                email: 'admin@admin.com',
                password: 'password',
                name: 'admin',
                roles: ['ADMIN'],
            })
            .expect(400)
            .expect({
                statusCode: 400,
                message: 'Email must be unique.',
                error: 'Bad Request',
            });
    });

    it('api/v1/user/profile GET', () => {
        return request(app.getHttpServer())
            .get('/api/v1/user/profile')
            .set('Authorization', `Bearer ${bearer}`)
            .expect(200);
    });
});
