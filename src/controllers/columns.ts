import { ExpressRequestInterface } from "../types/express-request.interface";
import { NextFunction, Response } from "express";
import ColumnModel from '../models/column';
import { Server } from "socket.io";
import { AppSocketInterface } from "../types/app-socket.interface";
import { getErrorMessage } from "../helpers";
import SocketEvents from "../types/socket-events.enum";
export const getColumns = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const columns = await ColumnModel.find({
            boardId: req.params.boardId,
        });
        res.send(columns);

    } catch (error) {
        next(error);
    }
}

export const createColumn = async (
    io: Server,
    socket: AppSocketInterface,
    data: {title: string, boardId: string}
): Promise<void> => {
    try {
        if(!socket.user) {
            socket.emit(
                SocketEvents.ColumnsCreateFailure,
                "User is not authorized",
            );
            return;
        }
        const newColumn = new ColumnModel({
            title: data.title,
            boardId: data.boardId,
            userId: socket.user.id,
        });
        const savedColumn = await newColumn.save();
        io.to(data.boardId).emit(SocketEvents.ColumnsCreateSuccess, savedColumn);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        socket.emit(SocketEvents.ColumnsCreateFailure, errorMessage);
    }
}
