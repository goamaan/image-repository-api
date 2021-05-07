import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';
import { DeleteManyImagesDto } from './dto/deleteMany-image.dto';
import { ImageService } from './image.service';
import { UpdateImageDto } from './dto/update-image.dto';
import { RequestWithUser } from 'src/utils/RequestWithUser';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/v1/images')
@UseGuards(RolesGuard)
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    async findAllImages(@Req() req: RequestWithUser) {
        return this.imageService.findAll(req);
    }

    @Get('/tag/:tag')
    @HttpCode(HttpStatus.OK)
    async findByTag(@Req() req: RequestWithUser, @Param('tag') tag: string) {
        return this.imageService.findByTag(req, tag);
    }

    @Get('/id/:id')
    @HttpCode(HttpStatus.OK)
    async findById(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.imageService.findById(req, id);
    }

    @Get('/all')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async findAllImagesAdmin() {
        return this.imageService.findAllAdmin();
    }

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
