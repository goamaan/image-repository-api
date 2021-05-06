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
                    Key: `user-images/${userId}-${new Date().toISOString()}-${
                        file.originalname
                    }`,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
                .promise(),
        );

        const uploadResponse = await Promise.all(promises);

        const uploadResult = uploadResponse.map((res, i) => ({
            url: res.Location,
            name: files[i].originalname,
            key: res.Key,
            owner: userId,
            tag: tags[i],
            isPublic,
        }));

        return uploadResult;
    }

    async deleteMany(keys: string[]) {
        const s3 = new Aws.S3({
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
            },
        });
        const promises = keys.map((key) =>
            s3
                .deleteObject({
                    Bucket: this.configService.get('AWS_S3_BUCKET'),
                    Key: key,
                })
                .promise(),
        );

        const deleteResponse = await Promise.all(promises);
        return deleteResponse;
    }
}
