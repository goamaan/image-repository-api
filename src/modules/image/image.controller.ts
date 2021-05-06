import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UploadImageDto } from './dto/upload-image.dto';
import { ImageService } from './image.service';

@Controller('api/v1/images')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post('upload')
    @UseInterceptors(FilesInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Req() req,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() uploadImageDto: UploadImageDto,
    ) {
        return this.imageService.upload(req, files, uploadImageDto);
    }
}
