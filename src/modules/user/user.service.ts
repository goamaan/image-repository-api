import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppRoles } from '../app/app.roles';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './user.schema';
import bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        private readonly authService: AuthService,
    ) {}

    get(id: string): Promise<UserDocument> {
        return this.userModel.findById(id).exec();
    }

    getByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email }).exec();
    }

    async register(createUserDto: CreateUserDto) {
        const { email, name, password, roles: receivedRoles } = createUserDto;

        const user = await this.userModel.create({
            email,
            name,
            password,
            roles: receivedRoles ? receivedRoles : [AppRoles.USER],
        });
        await this.isEmailUnique(user.email);
        await user.save();
        return this.generateResponse(user);
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.findUserByEmail(loginUserDto.email);
        await this.checkPassword(loginUserDto.password, user);
        return this.generateResponse(user);
    }

    private async isEmailUnique(email: string): Promise<void> {
        const user = await this.userModel.findOne({ email, verified: true });
        if (user) {
            throw new BadRequestException('Email most be unique.');
        }
    }

    private async findUserByEmail(email: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ email, verified: true });
        if (!user) {
            throw new NotFoundException('Wrong email or password.');
        }
        return user;
    }

    private async checkPassword(
        password: string,
        user: UserDocument,
    ): Promise<boolean> {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new NotFoundException('Wrong email or password.');
        }
        return true;
    }

    private async generateResponse(user: UserDocument) {
        return {
            name: user.name,
            email: user.email,
            accessToken: await this.authService.createAccessToken(user),
        };
    }

    private async delete(
        email: string,
    ): Promise<{
        message: string;
    }> {
        const profile = await this.userModel.deleteOne({ email });
        if (profile.deletedCount === 1) {
            return { message: `Deleted user with email: ${email}` };
        } else {
            throw new BadRequestException(
                `Failed to delete user with email: ${email}.`,
            );
        }
    }
}
