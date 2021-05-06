import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';
import { DeleteManyImagesDto } from './dto/deleteMany-image.dto';
import { ImageService } from './image.service';
import { UpdateImageDto } from './dto/update-image.dto';
import { RequestWithUser } from 'src/utils/RequestWithUser';

@Controller('api/v1/images')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post('upload')
    @UseInterceptors(FilesInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Req() req: RequestWithUser,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() uploadImageDto: UploadImageDto,
    ) {
        return this.imageService.upload(req, files, uploadImageDto);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    async deleteMany(
        @Req() req: RequestWithUser,
        @Body() deleteManyImagesDto: DeleteManyImagesDto,
    ) {
        return this.imageService.deleteMany(req, deleteManyImagesDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteOne(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.imageService.deleteOne(req, id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateOne(
        @Req() req: RequestWithUser,
        @Param('id') id: string,
        @Body() updateImageDto: UpdateImageDto,
    ) {
        return this.imageService.updateOne(req, id, updateImageDto);
    }
}
