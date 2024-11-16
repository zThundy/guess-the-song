

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