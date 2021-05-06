import { Module } from '@nestjs/common';
import { ConfigService } from 'aws-sdk';
import { ConfigModule } from '../config/config.module';
import { AwsService } from './aws.service';

@Module({
    imports: [ConfigModule],
    exports: [AwsService],
    providers: [AwsService, ConfigService],
})
export class AwsModule {}
