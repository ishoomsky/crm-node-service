import { Response, NextFunction } from 'express';
import BoardModel from '../models/board';
import { ExpressRequestInterface } from "../types/express-request.interface";
import { Server } from "socket.io";
import { AppSocketInterface } from "../types/app-socket.interface";

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

