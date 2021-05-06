import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { AwsService } from '../aws/aws.service';
import { ImageDocument } from './image.schema';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class ImageService {
    constructor(
        @InjectModel('Image') private readonly imageModel: Model<ImageDocument>,
        private readonly awsService: AwsService,
    ) {}

    async upload(
        req: Request,
        files: Express.Multer.File[],
        uploadImageDto: UploadImageDto,
    ) {
        const tags = uploadImageDto.tags;
        if (files.length === 0 || tags.length === 0) {
            throw new BadRequestException(
                `Number of files and tags must be greater than 0`,
            );
        }
        if (files.length !== tags.length) {
            throw new BadRequestException(
                `Number of files must equal number of tags, instead found ${files.length} files and ${uploadImageDto.tags.length} tags`,
            );
        }

        const uploadResults = this.awsService.upload(
            '',
            files,
            tags,
            uploadImageDto.isPublic,
        );
    }
}
