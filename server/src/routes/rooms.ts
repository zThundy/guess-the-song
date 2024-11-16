import router, { Request, Response } from "express";
import { RoomInstance } from "../../types/room_types";
import Room from "../room";
import db from "../sql";

const { addRoom, hasRoom, getRoom } = require('../states.ts');
const { hasProperty } = require('../utils.ts');

const roomsRouter = router();

roomsRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Rooms works!' });
});

roomsRouter.get('/all', async (req: Request, res: Response) => {
    let { offset, count } = req.query as any;
    if (!offset) offset = 0;
    count = count === 'true' ||
            count === '1' ||
            count === 'yes' ||
            count === true ||
            count === 1;
    
    const rooms = await db.getRooms(offset);
    if (count) res.setHeader('X-Total-Count', rooms.length);
    res.json(rooms);
});

roomsRouter.post('/validate', async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RoomInstance;

    if (!hasProperty(body, 'roomUniqueId')) {
        res.status(400).json({ message: 'Invalid body' });
        return;
    }

    try {
        let room: Room;
        if (hasRoom(body.roomUniqueId)) {
            room = getRoom(body.roomUniqueId);
        } else {
            room = new Room();
            await room.initRoom(body);
            await room.validateRoom();
            addRoom(room);
        }
        res.json(room.get());
    } catch (e: any) {
        res.status(400).json({ message: e.message });
        return;
    }
});

export default roomsRouter;