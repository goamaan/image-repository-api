import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import validator from 'validator';
import { User } from '../user/user.schema';

export type ImageDocument = Image & mongoose.Document;

@Schema({ timestamps: true })
export class Image {
    @Prop({ required: [true, 'Name cannot be blank'] })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
    owner: User;

    @Prop({ default: true })
    isPublic: boolean;

    @Prop({
        required: [true, 'URL cannot be blank'],
        validate: validator.isURL,
    })
    url: string;

    @Prop({ default: [] })
    tags: string[];
}

export const ImageSchema = SchemaFactory.createForClass(Image);
