import { IsNotEmpty } from 'class-validator';

export class DeleteManyImagesDto {
    @IsNotEmpty({ each: true })
    ids: string[];
}
