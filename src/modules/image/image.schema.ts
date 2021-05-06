import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import validator from 'validator';
import { User } from '../user/user.schema';

export type ImageDocument = Image & mongoose.Document;

@Schema({ timestamps: true })
export class Image {
    @Prop({ required: true })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner: User;

    @Prop({ required: true })
    key: string;

    @Prop({ default: true })
    isPublic: boolean;

    @Prop({
        required: true,
        validate: validator.isURL,
    })
    url: string;

    @Prop({ default: '' })
    tag: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
