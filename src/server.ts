import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import * as usersController from './controllers/users';
import * as boardsController from './controllers/board';
import bodyParser from 'body-parser';
import authMiddleware from './middlewares/auth';
import cors from 'cors';

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

mongoose.set('toJSON', {
    virtuals: true,
    transform: (_, converted) => {
        delete converted._id;
    }
})

app.get('/', (rec, res) => {
    res.send("API is UP");
});

app.post('/api/users/register', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/boards', authMiddleware, boardsController.getBoards)
app.get('/api/boards/:boardId', authMiddleware, boardsController.getBoard)
app.post('/api/boards', authMiddleware, boardsController.createBoards)


io.on('connection', () => {
    console.log('io connect');
});

mongoose.connect('mongodb://localhost:27017/crm')
    .then(() => {
        console.log('[MONGO DB] Connected');

        httpServer.listen(4001, () => {
            console.log('[SERVER] API is listening on port 4001');
        })
    });
