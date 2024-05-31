import { ExpressRequestInterface } from "../types/express-request.interface";
import { NextFunction, Response } from "express";
import ColumnModel from '../models/column';
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
