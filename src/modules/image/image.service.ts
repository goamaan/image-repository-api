import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsService } from '../aws/aws.service';
import { ImageDocument } from './image.schema';
import { UploadImageDto } from './dto/upload-image.dto';
import { UserDocument } from '../user/user.schema';

@Injectable()
export class ImageService {
    constructor(
        @InjectModel('Image') private readonly imageModel: Model<ImageDocument>,
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        private readonly awsService: AwsService,
    ) {}

    async upload(
        req,
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

        files.forEach((file) => this.checkFileType(file.originalname));

        const uploadResults = await this.awsService.upload(
            req.user.userId,
            files,
            tags,
            uploadImageDto.isPublic,
        );

        uploadResults.forEach(async (res) => {
            await new this.imageModel(res).save().then(async (image) => {
                await this.userModel.findOneAndUpdate(
                    { _id: req.user.userId },
                    { $push: { images: image } },
                );
            });
        });

        return uploadResults;
    }

    private checkFileType(filename: string) {
        if (!filename.match(/\.(jpg|jpeg|png|gif)$/)) {
            throw new BadRequestException('Only image files are supported!');
        }
    }
}
