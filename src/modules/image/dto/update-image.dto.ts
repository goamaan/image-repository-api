import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateImageDto {
    @IsBoolean()
    @IsOptional()
    isPublic: boolean;

    @IsString()
    @IsOptional()
    tag: string;
}
