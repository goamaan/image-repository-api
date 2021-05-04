import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
    let service: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConfigService],
        }).compile();

        service = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should default to development', () => {
        expect(service.isEnv('dev')).toBeTruthy();
    });

    it('should have all the env values', () => {
        expect(service.get('API_URL')).toEqual('http://localhost');
        expect(service.get('DB_URL')).toEqual(
            'mongodb://localhost/image-repository-api',
        );
        expect(service.get('JWT_SECRET_KEY')).toEqual('a8Nc08LkmQ');
        expect(service.get('JWT_EXPIRATION_TIME')).toEqual(2400);
    });
});
