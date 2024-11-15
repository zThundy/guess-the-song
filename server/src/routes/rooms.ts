import router, { Request, Response } from "express";
import {
    Room
} from "../../types/room_types";

const roomsRouter = router();

roomsRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Rooms works!' });
});

roomsRouter.post('/create', (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as Room;
    body.hasProperty = (key: string) => Object.keys(body).includes(key);
    
    if (
        body.hasProperty('roomName') &&
        body.hasProperty('maxPlayers') &&
        body.hasProperty('rounds') &&
        body.hasProperty('isPrivate') &&
        body.hasProperty('category') &&
        body.hasProperty('genre') &&
        body.hasProperty('difficulty') &&
        body.hasProperty('roomOwner')
    ) {
        res.json(body);
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});

export default roomsRouter;