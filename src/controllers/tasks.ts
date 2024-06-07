import { ExpressRequestInterface } from "../types/express-request.interface";
import { NextFunction, Response } from "express";
import TaskModel from '../models/task';
import { Server } from "socket.io";
import { AppSocketInterface } from "../types/app-socket.interface";
import { getErrorMessage } from "../helpers";
import SocketEvents from "../types/socket-events.enum";
import ColumnModel from "../models/column";
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

export const updateTask = async (
    io: Server,
    socket: AppSocketInterface,
    data: {
        boardId: string,
        taskId: string,
        fields: {
            title?: string,
            description?: string,
            columnId?: string,
        },
    }
) => {
    try {
        if (!socket.user) {
            socket.emit(SocketEvents.TasksUpdateFailure, getErrorMessage('User is not authorized'));
            return;
        }
        console.log('data.fields', data.fields)

        const updatedTask = await TaskModel.findByIdAndUpdate(
            data.taskId,
            data.fields,
            {
                new: true,
            },
        );
        io.to(data.boardId).emit(SocketEvents.TasksUpdateSuccess, updatedTask);
    } catch (error) {
        socket.emit(SocketEvents.TasksUpdateFailure, getErrorMessage(error));
    }
}


export const deleteTask = async (
    io: Server,
    socket: AppSocketInterface,
    data: {
        boardId: string,
        taskId: string,
    }
) => {
    try {
        if (!socket.user) {
            socket.emit(SocketEvents.TasksDeleteFailure, getErrorMessage('User is not authorized'));
            return;
        }
        await TaskModel.findOneAndDelete({ _id: data.taskId });
        io.to(data.boardId).emit(SocketEvents.TasksDeleteSuccess, data.taskId);
    } catch (error) {
        socket.emit(SocketEvents.TasksDeleteFailure, getErrorMessage(error));
    }
}

