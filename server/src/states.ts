

import User from "./user";
import Room from "./room";

const users = new Map<string, User>();
const rooms = new Map<string, Room>();

export const addUser = (user: User) => {
    users.set(user.uniqueId, user);
};

export const getUser = (uniqueId: string) => {
    return users.get(uniqueId);
};

export const hasUser = (uniqueId: string) => {
    return users.has(uniqueId);
};

export const removeUser = (uniqueId: string) => {
    users.delete(uniqueId);
};



export const getRooms = (): Map<string, Room> => {
    return rooms;
}

export const addRoom = (room: Room) => {
    rooms.set(room.roomUniqueId, room);
};

export const getRoom = (roomId: string) => {
    return rooms.get(roomId);
};

export const hasRoom = (roomId: string) => {
    return rooms.has(roomId);
};

export const removeRoom = (roomId: string) => {
    rooms.delete(roomId);
};

export const findRoomFromInviteCode = (inviteCode: string) => {
    if (typeof inviteCode !== "string") inviteCode = String(inviteCode);
    if (inviteCode.length < 1) return null;
    if (inviteCode === "*****") return null;
    for (let room of rooms.values()) {
        // convert every time the invite code to a string
        if (typeof room.inviteCode !== "string") room.update({ column: "inviteCode", value: String(room.inviteCode) });
        if (room.inviteCode === inviteCode) {
            return room;
        }
    }
    return null;
};

// return room from ownerId and if it is empty
export const findRoomFromRoomOwner = (roomOwner: string) => {
    if (typeof roomOwner !== "string") roomOwner = String(roomOwner);
    for (let room of rooms.values()) {
        if (room.isEmpty() && room.roomOwner === roomOwner) {
            return room;
        }
    }
    return null;
}

export const startGarbageCollect = (): void => {
    setInterval(() => {
        const _rooms = getRooms();
        console.debug(`[STATES] Garbage collector pass. ${new Date().toISOString()}`);
        // room cleanup
        let roomNum = 0;
        rooms.forEach((room: Room, key: string) => {
            roomNum += 1;
            if (room.getColumn("canCleanup")) {
                console.warn(`[STATES] Garbage collect of room ${room.getColumn("roomUniqueId")}`);
                rooms.delete(key);
            }
        })
        console.debug(`[STATES] Garbage collector finished pass. Rooms in state ${roomNum}.`);
    }, 5000)
}