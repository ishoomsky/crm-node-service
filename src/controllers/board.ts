import { Request, Response, NextFunction } from 'express';
import BoardModel from '../models/board';
import { ExpressRequestInterface } from "../types/expressRequest.interface";

export const getBoards = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        console.log(req.user.id)

        const boards = await BoardModel.find({
            userId: req.user.id
        });
        res.send(boards);

    } catch (error) {
        next(error);
    }
}
