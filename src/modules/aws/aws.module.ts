import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AwsService } from './aws.service';

@Module({
    imports: [ConfigModule],
    exports: [AwsService],
    providers: [AwsService],
})
export class AwsModule {}
