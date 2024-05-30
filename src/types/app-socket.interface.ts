import {Socket} from 'socket.io';
import { UserDocument } from "./user.interface";

export interface AppSocketInterface extends Socket {
    user?: UserDocument;
}
