import { IsNotEmpty, MinLength } from 'class-validator';

export class UploadImageDto {
    @IsNotEmpty({ each: true })
    @MinLength(3, { each: true })
    tags: string[];

    @IsNotEmpty()
    isPublic: boolean;
}
