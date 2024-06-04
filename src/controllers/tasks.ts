import { ExpressRequestInterface } from "../types/express-request.interface";
import { NextFunction, Response } from "express";
import TaskModel from '../models/task';
import { Server } from "socket.io";
import { AppSocketInterface } from "../types/app-socket.interface";
import { getErrorMessage } from "../helpers";
import SocketEvents from "../types/socket-events.enum";
export const getTasks = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const tasks = await TaskModel.find({
            boardId: req.params.boardId,
            columnId: req.params.columnId,
        });
        res.send(tasks);

    } catch (error) {
        next(error);
    }
}

export const createTask = async (
    io: Server,
    socket: AppSocketInterface,
    data: {title: string, boardId: string, columnId: string}
): Promise<void> => {
    try {
        if(!socket.user) {
            socket.emit(
                SocketEvents.TasksCreateFailure,
                "User is not authorized",
            );
            return;
        }
        const newTask = new TaskModel({
            title: data.title,
            boardId: data.boardId,
            columnId: data.columnId,
            userId: socket.user.id,
        });
        const savedTask = await newTask.save();
        io.to(data.boardId).emit(SocketEvents.TasksCreateSuccess, savedTask);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        socket.emit(SocketEvents.TasksCreateFailure, errorMessage);
    }
}
