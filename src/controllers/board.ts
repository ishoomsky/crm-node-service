import { Response, NextFunction } from 'express';
import BoardModel from '../models/board';
import { ExpressRequestInterface } from "../types/express-request.interface";
import { Server } from "socket.io";
import { AppSocketInterface } from "../types/app-socket.interface";
import SocketEvents from "../types/socket-events.enum";
import { getErrorMessage } from "../helpers";

export const getBoards = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const boards = await BoardModel.find({
            userId: req.user.id
        });
        res.send(boards);

    } catch (error) {
        next(error);
    }
}

export const getBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const board = await BoardModel.findById(req.params.boardId);
        res.send(board);

    } catch (error) {
        next(error);
    }
}

export const createBoards = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const newBoard = new BoardModel({
            title: req.body.title,
            userId: req.user.id,
        });
        const savedBoard = await newBoard.save();
        res.send(savedBoard);
    } catch (error) {
        next(error);
    }
}

export const joinBoard = (
    io: Server,
    socket: AppSocketInterface,
    data: { boardId: string }
) => {
    // console.log('server socket io join', data.boardId);
    console.log('socket user', socket.user);
    socket.join(data.boardId);
}

export const leaveBoard = (
    io: Server,
    socket: AppSocketInterface,
    data: { boardId: string }
) => {
    console.log('server socket io leave', data.boardId);
    socket.leave(data.boardId);
}

export const updateBoard = async (
    io: Server,
    socket: AppSocketInterface,
    data: {
        boardId: string,
        fields: {
            title: string,
        },
    }
) => {
    try {
        if (!socket.user) {
            socket.emit(SocketEvents.BoardsUpdateFailure, getErrorMessage('User is not authorized'));
            return;
        }
        const updatedBoard = await BoardModel.findByIdAndUpdate(
            data.boardId,
            data.fields,
            {
                new: true,
            },
        );
        io.to(data.boardId).emit(SocketEvents.BoardsUpdateSuccess, updatedBoard);
    } catch (error) {
        socket.emit(SocketEvents.BoardsUpdateFailure, getErrorMessage(error));
    }
}

