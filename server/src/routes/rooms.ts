import router, { Request, Response } from "express";
import {
    RoomInstance
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

    const body = req.body as RoomInstance;
    
    if (true) {
        res.json(body);
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});

export default roomsRouter;