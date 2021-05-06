import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsService } from '../aws/aws.service';
import { ImageDocument } from './image.schema';
import { UploadImageDto } from './dto/upload-image.dto';
import { UserDocument } from '../user/user.schema';
import { DeleteManyImagesDto } from './dto/deleteMany-image.dto';

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
        if (
            files.length === 0 ||
            tags.length === 0 ||
            files.length !== tags.length
        ) {
            throw new BadRequestException(
                `Number of files and tags must be greater than 0, and equal - instead found ${files.length} files and ${tags.length} tags`,
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

    async deleteMany(req, deleteManyImagesDto: DeleteManyImagesDto) {
        const { email } = req.user;
        const images = await this.imageModel
            .find({ _id: { $in: deleteManyImagesDto.ids } })
            .populate('owner');
        if (!images.every((img) => email === img.owner.email)) {
            throw new ForbiddenException('You may only delete your own images');
        }

        const keys = images.map((img) => img.key);
        const deleteResponse = await this.awsService.deleteMany(keys);
        await this.imageModel
            .deleteMany()
            .where('_id')
            .in(deleteManyImagesDto.ids)
            .exec();

        return { deleted: true, deleteResponse };
    }

    private checkFileType(filename: string) {
        if (!filename.match(/\.(jpg|jpeg|png|gif)$/)) {
            throw new BadRequestException('Only image files are supported!');
        }
    }
}
