import {
    Controller,
    Post,
    Body,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';

@Controller('api/v1/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.userService.register(createUserDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: Request, @Body() loginUserDto: LoginUserDto) {
        console.log(req.user);
        return await this.userService.login(loginUserDto);
    }
}
