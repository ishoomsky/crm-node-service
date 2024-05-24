import {Schema} from 'mongoose';

export interface Board {
    title: string;
    createdAt: Date;
    updateAt: Date;
    userId: Schema.Types.ObjectId;
}

export interface BoardDocument extends Document, Board {}
