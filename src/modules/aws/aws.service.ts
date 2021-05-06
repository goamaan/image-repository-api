import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import * as Aws from 'aws-sdk';

@Injectable()
export class AwsService {
    constructor(private readonly configService: ConfigService) {}

    async upload(
        userId: string,
        files: Express.Multer.File[],
        tags: string[],
        isPublic: boolean,
    ) {
        const s3 = new Aws.S3({
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
            },
        });
        const promises = files.map((file) =>
            s3
                .upload({
                    Bucket: this.configService.get('AWS_S3_BUCKET'),
                    Key: `user-images/${userId}-${
                        file.originalname
                    }-${new Date().toISOString()}`,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
                .promise(),
        );

        const uploadResponse = await Promise.all(promises);

        const uploadResult = uploadResponse.map((res) => ({
            url: res.Location,
            key: res.Key,
            owner: userId,
            isPublic,
        }));

        return uploadResult;
    }
}
