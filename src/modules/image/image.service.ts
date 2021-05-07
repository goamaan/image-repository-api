import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsService } from '../aws/aws.service';
import { ImageDocument } from './image.schema';
import { UploadImageDto } from './dto/upload-image.dto';
import { UserDocument } from '../user/user.schema';
import { DeleteManyImagesDto } from './dto/deleteMany-image.dto';
import * as mongoose from 'mongoose';
import { UpdateImageDto } from './dto/update-image.dto';
import { RequestWithUser } from 'src/utils/RequestWithUser';

@Injectable()
export class ImageService {
    constructor(
        @InjectModel('Image') private readonly imageModel: Model<ImageDocument>,
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        private readonly awsService: AwsService,
    ) {}

    async upload(
        req: RequestWithUser,
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
        const responseWithIdPromise = uploadResults.map(async (res) => {
            const image = await new this.imageModel(res).save();
            await this.userModel.findOneAndUpdate(
                { _id: req.user.userId },
                { $push: { images: image } },
            );
            return { _id: image._id, ...res };
        });
        const responseWIthIds = Promise.all(responseWithIdPromise);

        return responseWIthIds;
    }

    async deleteMany(
        req: RequestWithUser,
        deleteManyImagesDto: DeleteManyImagesDto,
    ) {
        const { email } = req.user;

        deleteManyImagesDto.ids.forEach((id) => this.checkIdValidity(id));

        const images = await this.imageModel
            .find({
                _id: { $in: deleteManyImagesDto.ids },
            })
            .populate('owner');

        if (!images) {
            throw new NotFoundException('Id not found');
        }

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
        await this.userModel.findOneAndUpdate(
            { _id: req.user.userId },
            { $pull: { images: { $in: deleteManyImagesDto.ids } } },
        );

        return { deleted: true, deleteResponse };
    }

    async deleteOne(req: RequestWithUser, id: string) {
        const { email } = req.user;

        this.checkIdValidity(id);
        const image = await this.imageModel.findById(id).populate('owner');

        if (!image) {
            throw new NotFoundException('Id not found');
        }

        if (image.owner.email !== email) {
            throw new ForbiddenException('You may only delete your own images');
        }

        const deleteResponse = await this.awsService.deleteOne(image.key);
        await this.imageModel.findByIdAndDelete(id);
        await this.userModel.findOneAndUpdate(
            { _id: req.user.userId },
            { $pull: { images: id } },
        );
        return { deleted: true, deleteResponse };
    }

    async updateOne(
        req: RequestWithUser,
        id: string,
        updateImageDto: UpdateImageDto,
    ) {
        const { email } = req.user;

        this.checkIdValidity(id);
        const image = await this.imageModel.findById(id).populate('owner');

        if (!image) {
            throw new NotFoundException('Id not found');
        }

        if (image.owner.email !== email) {
            throw new ForbiddenException('You may only edit your own images');
        }

        const response = await this.imageModel.findByIdAndUpdate(
            id,
            {
                isPublic:
                    updateImageDto.isPublic === undefined ||
                    updateImageDto.isPublic === null
                        ? image.isPublic
                        : updateImageDto.isPublic,
                tag: updateImageDto.tag || image.tag,
            },
            { new: true },
        );
        return { updatedImage: response };
    }

    async findAll(req: RequestWithUser) {
        const { userId } = req.user;
        const user = await this.userModel.findById(userId);

        const images = await this.imageModel.find({
            $or: [{ isPublic: true }, { owner: user }],
        });

        if (images.length === 0 || images === undefined || images === null) {
            return { found: false, images };
        }

        return { found: true, images };
    }

    async findByTag(req: RequestWithUser, tag: string) {
        const { userId } = req.user;
        const user = await this.userModel.findById(userId);
        const images = await this.imageModel.find({
            $or: [
                { $and: [{ isPublic: true }, { tag }] },
                { $and: [{ owner: user }, { tag }] },
            ],
        });

        if (images.length === 0 || images === undefined || images === null) {
            return { found: false, images };
        }

        console.log(images);

        return { found: true, images };
    }

    private checkIdValidity(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`${id} is not a valid Object Id`);
        }
    }

    private checkFileType(filename: string) {
        if (!filename.match(/\.(jpg|jpeg|png|gif)$/)) {
            throw new BadRequestException('Only image files are supported!');
        }
    }
}
