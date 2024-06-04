import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import * as usersController from './controllers/users';
import * as boardsController from './controllers/board';
import * as columnsController from './controllers/columns';
import * as tasksController from './controllers/tasks';

import bodyParser from 'body-parser';
import authMiddleware from './middlewares/auth';
import cors from 'cors';
import SocketEventsEnum from "./types/socket-events.enum";
import jwt from 'jsonwebtoken';
import { secret } from "./config";
import User from './models/user';
import { AppSocketInterface } from "./types/app-socket.interface";
import task from "./models/task";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));


app.get('/', (rec, res) => {
    res.send("API is UP");
});

app.post('/api/users/register', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/boards', authMiddleware, boardsController.getBoards);
app.get('/api/boards/:boardId', authMiddleware, boardsController.getBoard);
app.post('/api/boards', authMiddleware, boardsController.createBoards);
app.get('/api/boards/:boardId/columns', authMiddleware, columnsController.getColumns);
app.get('/api/boards/:boardId/tasks/', authMiddleware, tasksController.getTasks);



io.use(async (socket: AppSocketInterface, next) => {
    try {
        const token = (socket.handshake.auth.token as string) ?? '';
        const data = jwt.verify(token.split(' ')[1], secret) as {id: string, email: string};
        const user = await User.findById(data.id);

        if (!user) {
            return next(new Error('Authentication error'));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error'))
    }
}).on('connection', (socket) => {
    socket.on(SocketEventsEnum.BoardsJoin, (data) => {
        boardsController.joinBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.BoardsLeave, (data) => {
        boardsController.leaveBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.ColumnsCreate, (data) => {
        columnsController.createColumn(io, socket, data);
    });
    socket.on(SocketEventsEnum.TasksCreate, (data) => {
        tasksController.createTask(io, socket, data);
    });
    socket.on(SocketEventsEnum.BoardsUpdate, (data) => {
        boardsController.updateBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.BoardsDelete, (data) => {
        boardsController.deleteBoard(io, socket, data);
    });
});

mongoose.set('toJSON', {
    virtuals: true,
    transform: (_, converted) => {
        delete converted._id;
    }
})
mongoose.connect('mongodb://localhost:27017/crm')
    .then(() => {
        console.log('[MONGO DB] Connected');

        httpServer.listen(4001, () => {
            console.log('[SERVER] API is listening on port 4001');
        })
    });
