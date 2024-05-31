import {Schema} from 'mongoose';

export interface Column {
    title: string;
    createdAt: Date;
    updateAt: Date;
    userId: Schema.Types.ObjectId;
    boardId: Schema.Types.ObjectId
}

export interface ColumnDocument extends Document, Column {}
