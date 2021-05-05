import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import validator from 'validator';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: [true, 'Name cannot be blank'] })
    name: string;

    @Prop({
        required: [true, 'Email cannot be blank'],
        validate: validator.isEmail,
    })
    email: number;

    @Prop({
        required: [true, 'Password cannot be blank'],
        minlength: 6,
        maxlength: 255,
    })
    password: string;

    @Prop({ default: ['user'] })
    roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
