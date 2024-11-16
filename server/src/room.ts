
import {
    UserInstance
} from '../types/user_types';

import {
    RoomInstance
} from '../types/room_types';

import User from './user';

export default class Room {
    public roomOwner: string = '';
    public inviteCode: string = '';
    public roomName: string = '';
    public maxPlayers: number = 0;
    public rounds: number = 0;
    public isPrivate: boolean = false;
    public category: string = '';
    public genre: string = '';
    public difficulty: number = 0;

    public currentRound: number = 0;
    public users: User[] = [];

    constructor(room: RoomInstance) {
        this.roomOwner = room.roomOwner;
        this.inviteCode = room.inviteCode;
        this.roomName = room.roomName;
        this.maxPlayers = room.maxPlayers;
        this.rounds = room.rounds;
        this.isPrivate = room.isPrivate;
        this.category = room.category;
        this.genre = room.genre;
        this.difficulty = room.difficulty;

        console.log(`Room ${this.roomName} has been created.`);
    }

    private hasProperty(key: string) {
        return Object.keys(this).includes(key);
    }

    private makeUserId(): string {
        // generate a unique id and check if it already exists
        let uniqueId = '';
        let exists = true;

        while (exists) {
            uniqueId = Math.random().toString(36).substring(2, 20);
            exists = this.users.some(u => u.uniqueId === uniqueId);
        }

        return uniqueId;
    }

    addToRoom(user: UserInstance): void {
        console.log(`${user.username} has joined the room.`);
        // const newUser = new User(user);
        // this.users.push(newUser);
    }

    removeFromRoom(user: UserInstance): void {
        console.log(`${user.username} has left the room.`);
        this.users = this.users.filter(u => u.uniqueId !== user.uniqueId);
    }

    isInRoom(user: UserInstance): boolean {
        return this.users.some(u => u.uniqueId === user.uniqueId);
    }

    get getCurrentRound(): number {
        return this.currentRound;
    }

    set setCurrentRound(round: number) {
        this.currentRound = round;
    }

    get getRoomOwner(): string {
        return this.roomOwner;
    }

    get getInviteCode(): string {
        return this.inviteCode;
    }

    get getRoomName(): string {
        return this.roomName;
    }

    set setRoomName(name: string) {
        this.roomName = name;
    }
}

export {
    Room
}