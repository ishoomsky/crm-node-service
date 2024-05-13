import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.get('/', (rec, res) => {
    res.send("API is UP");
})

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
