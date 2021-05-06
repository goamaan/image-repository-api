import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { JwtPayload } from './payload-interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
    ) {}

    async createAccessToken(user: UserDocument) {
        const payload = { email: user.email, userId: user._id };
        return this.jwtService.sign(payload);
    }

    async validate(payload: JwtPayload) {
        const user = await this.userModel.findOne({
            _id: payload.userId,
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return { email: user.email, userId: user._id };
    }
}
