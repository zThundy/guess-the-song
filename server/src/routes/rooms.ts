import router, { Request, Response } from "express";
import { RoomInstance } from "../../types/room_types";
import Room from "../room";
import User from "../user";
import db from "../sql";
import { removeRoom } from "../states";

const { addRoom, hasRoom, getRoom, getUser, addUser, findRoomFromInviteCode, findRoomFromRoomOwner } = require('../states.ts');
const { hasProperty } = require('../utils.ts');

const roomsRouter = router();

roomsRouter.use((req: Request, res: Response, next: Function) => {
    console.log("Got request on /rooms. URL: " + req.url);
    next();
});

roomsRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Rooms works!' });
});

roomsRouter.get('/all', async (req: Request, res: Response) => {
    let { offset, count, roomId, inviteCode } = req.query as any;
    if (!offset) offset = 0;
    count = count === 'true' ||
            count === '1' ||
            count === 'yes' ||
            count === true ||
            count === 1;
    
    let resRooms = new Array<RoomInstance>();
    const rooms = await db.getRooms(offset);

    for (let dbRoom of rooms) {
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
        if (users.length === 0 && room.users.length === 0) {
            console.error(`Room ${room.getColumn('roomUniqueId')} is empty, deleting room.`);
            await room.deleteRoom(room.getColumn('roomUniqueId'));
            removeRoom(room.getColumn('roomUniqueId'));
        }

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

        const roomData = room.get();
        // hide invite code from private rooms
        if (room.getColumn('isPrivate')) {
            console.warn(`Hiding invite code for room ${room.getColumn('roomUniqueId')}, it was ${roomData.inviteCode}`);
            roomData.inviteCode = "*****";
        }
        resRooms.push(roomData);
    }

    if (inviteCode) resRooms = resRooms.filter(room => room.inviteCode === inviteCode);
    if (roomId) resRooms = resRooms.filter(room => room.roomUniqueId === roomId);
    if (count) res.setHeader('X-Total-Count', resRooms.length);
    // setTimeout(() => res.json(resRooms), 10000);
    res.json(resRooms);
});

roomsRouter.post("/validateInviteCode", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        console.error('Invalid content-type in /validateInviteCode');
        res.status(400).json({ key: "GENERIC_ERROR", message: 'Invalid content-type' });
        return;
    }

    const body = req.body as any;
    if (!hasProperty(body, 'inviteCode')) {
        console.error('Invalid body in /validateInviteCode - missing inviteCode');
        res.status(400).json({ key: "GENERIC_ERROR_INVALID_BODY", message: 'Invalid body' });
        return;
    }

    try {
        const user = getUser(body.uniqueId);
        if (!user) {
            console.error(`User not found with uniqueId ${body.uniqueId}`);
            res.status(404).json({ key: "GENERIC_ERROR_USER_NOT_FOUND", message: 'User not found' });
            return;
        }
        let room = findRoomFromRoomOwner(body.uniqueId);
        if (!room) {
            console.error(`Room not found with roomOwner ${body.uniqueId}, trying inviteCode ${body.inviteCode}`);
            room = findRoomFromInviteCode(body.inviteCode);
            if (!room) {
                console.error(`Room not found with invite code ${body.inviteCode}, trying db`);
                const dbRoom = await db.getRoom(body.inviteCode);
                if (!dbRoom[0]) {
                    console.error(`Room not found with invite code ${body.inviteCode}`);
                    res.status(404).json({ key: "GENERIC_ERROR_ROOM_NOT_FOUND", message: 'Room not found' });
                    return;
                }
                room = new Room();
                await room.initRoom(dbRoom[0]);
                await room.validateRoom();
                addRoom(room);
            }
        }
        if (room.users.length === 0) {
            console.error(`Room ${room.getColumn('roomUniqueId')} is empty, deleting room.`);
            await room.deleteRoom(room.getColumn('roomUniqueId'));
            removeRoom(room.getColumn('roomUniqueId'));
            res.status(404).json({ key: "GENERIC_ERROR_ROOM_NOT_FOUND", message: 'Room not found' });
            return;
        }
        if (room.started) {
            console.error(`Room ${room.getColumn('roomUniqueId')} is already started`);
            res.status(403).json({ key: "JOIN_ERROR_ROOM_STARTED", message: 'Room is already started' });
            return;
        }
        if (room.isFull() && !room.isInRoom(user)) {
            console.error(`Room ${room.getColumn('roomUniqueId')} is full`);
            res.status(403).json({ key: "JOIN_ERROR_ROOM_FULL", message: "Room is full" });
            return;
        }
        room.addUser(user);
        res.json(room.get());
    } catch (e: any) {
        console.error(`Error in /validateInviteCode: ${e.message}`);
        res.status(400).json({ key: "GENERIC_ERROR", message: e.message });
        return;
    }
});

roomsRouter.post('/validate', async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        console.error('Invalid content-type in /validate');
        res.status(400).json({ key: "GENERIC_ERROR", message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RoomInstance;
    if (!hasProperty(body, 'roomUniqueId')) {
        console.error('Invalid body in /validate - missing roomUniqueId');
        res.status(400).json({ key: "GENERIC_ERROR_INVALID_BODY", message: 'Invalid body' });
        return;
    }

    try {
        let creating = false;
        const user = getUser(body.roomOwner);
        if (!user) {
            console.error(`User not found with uniqueId ${body.roomOwner}`);
            res.status(404).json({ key: "GENERIC_ERROR_USER_NOT_FOUND", message: 'User not found' });
            return;
        }
        let roomData: any;
        if (hasRoom(body.roomUniqueId)) {
            const room = getRoom(body.roomUniqueId);
            roomData = room.get();
        } else {
            const room = new Room();
            await room.initRoom(body);
            await room.validateRoom();
            addRoom(room);
            room.addUser(user);
            roomData = room.get();
            creating = true;
        }
        if (roomData.isPrivate && !creating) {
            console.warn(`Hiding invite code for room ${roomData.uniqueId}, it was ${roomData.inviteCode}`);
            roomData.inviteCode = "*****";
        }
        res.json(roomData);
    } catch (e: any) {
        console.error(`Error in /validate: ${e.message}`);
        res.status(400).json({ key: "GENERIC_ERROR", message: e.message });
        return;
    }
});

roomsRouter.get("/users/:inviteCode", async (req: Request, res: Response) => {
    const { inviteCode } = req.params;
    if (!inviteCode) {
        console.error('Invalid inviteCode in /users/:inviteCode');
        res.status(400).json({ key: "GENERIC_ERROR_INVALID_ROOM_ID", message: 'Invalid inviteCode' });
        return;
    }

    try {
        const room = findRoomFromInviteCode(inviteCode);
        if (!room) {
            console.error(`Room not found with inviteCode ${inviteCode}`);
            res.status(404).json({ key: "GENERIC_ERROR_ROOM_NOT_FOUND", message: 'Room not found' });
            return;
        }
        const users = room.getColumn('users');
        res.json(users);
    } catch (e: any) {
        console.error(`Error in /users/:inviteCode: ${e.message}`);
        res.status(400).json({ key: "GENERIC_ERROR", message: e.message });
        return;
    }
});

roomsRouter.post("/leave", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        console.error('Invalid content-type in /leave');
        res.status(400).json({ key: "GENERIC_ERROR", message: 'Invalid content-type' });
        return;
    }

    const body = req.body as any;
    if (!hasProperty(body, 'roomUniqueId') || !hasProperty(body, 'uniqueId')) {
        console.error('Invalid body in /leave - missing roomUniqueId or uniqueId');
        res.status(400).json({ key: "GENERIC_ERROR_INVALID_BODY", message: 'Invalid body' });
        return;
    }

    try {
        const room = getRoom(body.roomUniqueId);
        if (!room) {
            console.error(`Room not found with roomUniqueId ${body.roomUniqueId}`);
            res.status(404).json({ key: "GENERIC_ERROR_ROOM_NOT_FOUND", message: 'Room not found' });
            return;
        }
        const user = getUser(body.uniqueId);
        if (!user) {
            console.error(`User not found with uniqueId ${body.uniqueId}`);
            res.status(404).json({ key: "GENERIC_ERROR_USER_NOT_FOUND", message: 'User not found' });
            return;
        }
        room.removeUser(user);

        // check if room is empty
        if (room.getColumn('users').length === 0) {
            console.log(`Room ${room.getColumn('roomUniqueId')} is empty, deleting room.`);
            await room.deleteRoom(room.getColumn('roomUniqueId'));
            removeRoom(room.getColumn('roomUniqueId'));
        } else {
            await db.removeUserFromRoom(user.getColumn('uniqueId'), room.getColumn('roomUniqueId'));
        }

        res.json(room.get());
    } catch (e: any) {
        console.error(`Error in /leave: ${e.message}`);
        res.status(400).json({ key: "GENERIC_ERROR", message: e.message });
        return;
    }
});

roomsRouter.post("/start/:roomUniqueId", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        console.error('Invalid content-type in /start/:roomUniqueId');
        res.status(400).json({ key: "GENERIC_ERROR", message: 'Invalid content-type' });
        return;
    }

    const { roomUniqueId } = req.params;
    if (!roomUniqueId) {
        console.error('Invalid roomUniqueId in /start/:roomUniqueId');
        res.status(400).json({ key: "GENERIC_ERROR_INVALID_ROOM_ID", message: 'Invalid roomUniqueId' });
        return;
    }

    const body = req.body as any;
    if (!hasProperty(body, 'uniqueId')) {
        console.error('Invalid body in /start/:roomUniqueId - missing uniqueId');
        res.status(400).json({ key: "GENERIC_ERROR_INVALID_BODY", message: 'Invalid body' });
        return;
    }

    try {
        const room = getRoom(roomUniqueId);
        if (!room) {
            console.error(`Room not found with roomUniqueId ${roomUniqueId}`);
            res.status(404).json({ key: "GENERIC_ERROR_ROOM_NOT_FOUND", message: 'Room not found' });
            return;
        }
        const user = getUser(body.uniqueId);
        if (!user) {
            console.error(`User not found with uniqueId ${body.uniqueId}`);
            res.status(404).json({ key: "GENERIC_ERROR_USER_NOT_FOUND", message: 'User not found' });
            return;
        }
        if (room.getColumn('roomOwner') !== user.getColumn('uniqueId')) {
            console.error(`User ${user.getColumn('uniqueId')} is not the room owner ${room.getColumn('roomOwner')}`);
            res.status(403).json({ key: "GENERIC_ERROR_NOT_ROOM_OWNER", message: 'User is not the room owner' });
            return;
        }
        if (!room.start(user)) {
            console.error(`Room ${room.getColumn('roomUniqueId')} could not be started`);
            res.status(400).json({ key: "GENERIC_ERROR_ROOM_NOT_STARTED", message: 'Room could not be started. Not enough players.' });
            return;
        }
        res.json(room.get());
    } catch (e: any) {
        console.error(`Error in /start/:roomUniqueId: ${e.message}`);
        res.status(400).json({ key: "GENERIC_ERROR", message: e.message });
        return;
    }
});

// roomsRouter.get('/:roomUniqueId', async (req: Request, res: Response) => {
//     const { roomUniqueId } = req.params;
//     if (!roomUniqueId) {
//         console.error('Invalid roomUniqueId in /rooms/:roomUniqueId');
//         res.status(400).json({ key: "GENERIC_ERROR_INVALID_ROOM_ID", message: 'Invalid roomUniqueId' });
//         return;
//     }

//     try {
//         const room = getRoom(roomUniqueId);
//         if (!room) {
//             console.error(`Room not found with roomUniqueId ${roomUniqueId}`);
//             res.status(404).json({ key: "GENERIC_ERROR_ROOM_NOT_FOUND", message: 'Room not found' });
//             return;
//         }
//         res.json(room.get());
//     } catch (e: any) {
//         console.error(`Error in /rooms/:roomUniqueId: ${e.message}`);
//         res.status(400).json({ key: "GENERIC_ERROR", message: e.message });
//         return;
//     }
// });

export default roomsRouter;