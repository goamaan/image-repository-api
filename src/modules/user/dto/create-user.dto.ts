import {
    IsEmail,
    IsNotEmpty,
    MinLength,
    IsAlphanumeric,
    IsArray,
    IsOptional,
} from 'class-validator';

export class CreateUserDto {
    @IsAlphanumeric()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsArray()
    roles?: string[];
}
