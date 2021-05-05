import {
    BadRequestException,
    Injectable,
    NotAcceptableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppRoles } from '../app/app.roles';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './user.schema';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
    ) {}

    get(id: string): Promise<UserDocument> {
        return this.userModel.findById(id).exec();
    }

    getByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email }).exec();
    }

    async create(payload: CreateUserDto): Promise<UserDocument> {
        const user = await this.getByEmail(payload.email);
        if (user) {
            throw new NotAcceptableException('The email is already in use.');
        }

        const createdProfile = new this.userModel({
            ...payload,
            password: bcrypt.hashSync(payload.password, 8),
            roles: payload.roles ? payload.roles : [AppRoles.USER],
        });

        return createdProfile.save();
    }

    async delete(
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
