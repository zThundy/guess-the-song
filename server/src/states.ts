

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
    for (let room of rooms.values()) {
        // convert every time the invite code to a string
        if (typeof room.inviteCode !== "string") room.update("inviteCode", String(room.inviteCode));
        if (room.inviteCode === inviteCode) {
            return room;
        }
    }
    return null;
};