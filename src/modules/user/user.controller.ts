import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
    Get,
} from '@nestjs/common';
import { RequestWithUser } from 'src/utils/RequestWithUser';
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
    async login(@Body() loginUserDto: LoginUserDto) {
        return await this.userService.login(loginUserDto);
    }

    @Get('/profile')
    @HttpCode(HttpStatus.OK)
    async profile(@Req() req: RequestWithUser) {
        return await this.userService.get(req.user.userId);
    }
}
