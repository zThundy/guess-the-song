import router, { Request, Response } from "express";
import { RoomInstance } from "../../types/room_types";
import Room from "../room";
import User from "../user";
import db from "../sql";

const { addRoom, hasRoom, getRoom, getUser, addUser, findRoomFromInviteCode } = require('../states.ts');
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
    
    let resRooms = new Array<RoomInstance>();
    const rooms = await db.getRooms(offset);

    for (let dbRoom of rooms) {
        console.log(dbRoom);
        let room = getRoom(dbRoom['roomUniqueId']);
        if (!room) {
            console.log(`Room ${dbRoom['roomUniqueId']} not found, creating new room.`);
            room = new Room();
            await room.initRoom(dbRoom);
            await room.validateRoom();
            addRoom(room);
        }

        console.log(`Room ${room.getColumn('roomUniqueId')} found, adding users.`);

        const users = await db.getUsersInRoom(room.getColumn('roomUniqueId'));
        for (let dbUser of users) {
            let user = getUser(dbUser['uniqueId']);
            if (!user) {
                user = new User(dbUser['uniqueId'], dbUser['username'], dbUser['userImage']);
                await user.validateUser();
                addUser(user);
            }
            if (!room.isInRoom(user)) {
                console.log(`Adding user ${user.getColumn('uniqueId')} to room ${room.getColumn('roomUniqueId')}`);
                room.addUser(user);
            }
        }

        // if (room.get('users').length === 0) {
        //     await db.deleteRoom(room.get('roomUniqueId'));
        //     continue;
        // }

        resRooms.push(room.get());
        // console.log(room.getColumn('roomUniqueId'), resRooms);
    }

    if (count) res.setHeader('X-Total-Count', rooms.length);
    // setTimeout(() => res.json(resRooms), 10000);
    res.json(resRooms);
});

roomsRouter.post("/validateInviteCode", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RoomInstance;

    if (!hasProperty(body, 'inviteCode')) {
        res.status(400).json({ message: 'Invalid body' });
        return;
    }

    try {
        const room = findRoomFromInviteCode(body.inviteCode);
        if (!room) {
            res.status(404).json({ message: 'Room not found' });
            return;
        }
        res.json(room.get());
    } catch (e: any) {
        res.status(400).json({ message: e.message });
        return;
    }
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