
import { UserInstance } from '../types/user_types';
import { RoomInstance } from '../types/room_types';

import User from './user';
import { hasProperty } from './utils';
import db from './sql';

const { getUser, addUser } = require('./states');
const WSWrapper = require('./wswrapper');

export default class Room {
    public roomUniqueId: string = '';
    public roomOwner: string = '';
    public inviteCode: string = '';
    public roomName: string = '';
    public maxPlayers: number = 0;
    public rounds: number = 0;
    public isPrivate: boolean = false;
    public category: string = '';
    public genre: string = '';
    public difficulty: number = 0;
    public started: boolean = false;
    public canCleanup: boolean = false;

    public currentRound: number = 0;
    public users: User[] = [];

    constructor() { }

    // destructor to initialize the room with data


    public async initRoom(data: RoomInstance): Promise<void> {
        if (!hasProperty(data, 'roomUniqueId')) throw new Error('Invalid room id while initializing room.');

        this.roomUniqueId = data.roomUniqueId;
        this.roomOwner = data.roomOwner;
        this.roomName = data.roomName;
        this.maxPlayers = data.maxPlayers;
        this.rounds = data.rounds;
        this.isPrivate = data.isPrivate;
        this.category = data.category;
        this.genre = data.genre;
        this.difficulty = data.difficulty;
        this.started = data.started || false;

        // check types
        if (typeof this.roomUniqueId !== 'string') this.roomUniqueId = String(this.roomUniqueId);

        const roomPingUsersInterval = setInterval(() => {
            if (this.users.length > 0) {
                this.canCleanup = false;
                this.users.forEach(user => {
                    WSWrapper.send({ route: "room", type: 'game-ping', data: { user: user.get(), room: this.get() } });
                    console.debug(`[ROOM-MANAGER] Sending room hearthbeat to ${user.getColumn("username")} (${user.getColumn("uniqueId")}). Last ping was ${user.getColumn("userLastRoomPing")}`)

                    // check if the last ping of the user is more than 30 seconds ago, if so remove it from the roomm
                    const lastPing = new Date(user.userLastRoomPing);
                    const currentTime = new Date();
                    const diffTime = Math.abs(currentTime.getTime() - lastPing.getTime());
                    const diffSeconds = Math.ceil(diffTime / 1000);
                    console.debug(`[ROOM-MANAGER] Room hearthbeat times are: Room: ${this.getColumn("roomUniqueId")} User: ${user.getColumn("userLastRoomPing")}, Room: ${currentTime.toISOString()}, Difftime: ${diffTime}, Diffseconds: ${diffSeconds}`)
                    if (diffSeconds > 30) {
                        console.warn(`[ROOM-MANAGER] User ${user.username} (${user.uniqueId}) has not pinged in the last 30 seconds, removing from room ${this.roomUniqueId}.`);
                        this.removeUser(user);
                    }
                });
            } else {
                clearInterval(roomPingUsersInterval);
                this.deleteRoom();
                this.canCleanup = true;
            }
        }, 10 * 1000); // every 10 seconds

        WSWrapper.on("game-pong", (r: any) => {
            const data = r.data;
            if (data && data.roomUniqueId && data.roomUniqueId === this.roomUniqueId) {
                if (data.uniqueId && data.uniqueId.length > 0) {
                    // check if the user is in the room
                    const user = getUser(data.uniqueId);
                    if (user) {
                        user.update({ column: 'userLastRoomPing', value: new Date().toISOString() });
                        console.debug(`[ROOM-MANAGER] User ${user.username} (${user.uniqueId}) pinged the room ${this.roomUniqueId}.`);
                    }
                }
            }
        });

        console.log(`[ROOM-MANAGER] Room "${this.roomUniqueId || "UNK"}" class has been initialized - ROOM NOT YET READY.`);
    }

    public deleteRoom(): void {
        console.log(`[ROOM-MANAGER] Deleting room ${this.roomUniqueId}. Sending message "lobby-refresh" to all clients.`);
        WSWrapper.send({ route: "room", type: "lobby-refresh", action: "delete", data: { room: this.get() } });
        console.log(`[ROOM-MANAGER] Deleting room ${this.roomUniqueId}. Message sent.`);
        db.deleteRoom(this.roomUniqueId);
    }

    public update(key: string, value: any): void {
        if (key in this) {
            console.log(`[ROOM-MANAGER] Updating ${key} to ${value}`);
            (this as any)[key] = value;
            // WSWrapper.send({ route: "room", type: 'update', column: key, value: value });
        } else {
            console.error(`[ROOM-MANAGER] Invalid key: ${key}`);
        }
    }

    public getColumn(column: string): any {
        if (column in this) {
            return (this as any)[column];
        } else {
            console.error(`[ROOM-MANAGER] Invalid column: ${column}`);
            return null;
        }
    }

    private validateUser(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let user = getUser(this.roomOwner);
            if (!user) {
                console.error("[ROOM-MANAGER] User not found, trying database.");
                let dbUser = await db.getUser(this.roomOwner);
                dbUser = dbUser[0];
                if (dbUser) {
                    console.log(`[ROOM-MANAGER] User ${dbUser.username} found in database.`);
                    user = new User(dbUser.uniqueId, dbUser.username, dbUser.userImage);
                    await user.validateUser();
                    addUser(user);
                } else {
                    // try and get the roomOwner from the rooms database
                    let dbRoom = await db.getRoom(this.roomUniqueId);
                    dbRoom = dbRoom[0];

                    if (dbRoom) {
                        console.log(`[ROOM-MANAGER] User ${dbRoom.roomOwner} found in database.`);
                        user = new User(dbRoom.roomOwner, dbRoom.roomOwner, '');
                        await user.validateUser();
                        addUser(user);
                    } else {
                        return reject({ message: "User not found in database or in state storage. FATAL - Can't validate" });
                    }
                }
            } else {
                this.roomOwner = user.uniqueId;
            }

            console.log(`[ROOM-MANAGER] Room owner: ${user.username} (${user.uniqueId}) validated.`);
            resolve();
        });
    }

    private async makeroomUniqueId(): Promise<string> {
        const isroomUniqueIdUnique = await db.doesRoomExist(this.roomUniqueId);
        this.roomUniqueId = Math.random().toString(36).substring(2, 180);
        if (isroomUniqueIdUnique) {
            return this.makeroomUniqueId();
        } else {
            return this.roomUniqueId;
        }
    }

    public async validateRoom() {
        try {
            await this.validateUser();
            let dbRoom = await db.getRoom(this.roomUniqueId);
            dbRoom = dbRoom[0];

            if (dbRoom) {
                if (dbRoom.roomName !== this.roomName) {
                    this.update('roomName', dbRoom.roomName);
                }

                if (dbRoom.roomOwner !== this.roomOwner) {
                    this.update('roomOwner', dbRoom.roomOwner);
                }

                if (dbRoom.inviteCode !== this.inviteCode) {
                    if (typeof dbRoom.inviteCode !== 'string') dbRoom.inviteCode = String(dbRoom.inviteCode);
                    this.update('inviteCode', dbRoom.inviteCode);
                }

                if (dbRoom.maxPlayers !== this.maxPlayers) {
                    this.update('maxPlayers', dbRoom.maxPlayers);
                }

                if (dbRoom.rounds !== this.rounds) {
                    this.update('rounds', dbRoom.rounds);
                }

                if (dbRoom.isPrivate !== this.isPrivate) {
                    this.update('isPrivate', dbRoom.isPrivate);
                }

                if (dbRoom.category !== this.category) {
                    this.update('category', dbRoom.category);
                }

                if (dbRoom.genre !== this.genre) {
                    this.update('genre', dbRoom.genre);
                }

                if (dbRoom.difficulty !== this.difficulty) {
                    this.update('difficulty', dbRoom.difficulty);
                }

                let dbRoomUsers = await db.getUsersInRoom(this.roomUniqueId);
                dbRoomUsers.forEach((user: UserInstance) => {
                    const stateUser = getUser(user.uniqueId);
                    if (stateUser) {
                        stateUser.update({ column: 'currentRoom', value: this.roomUniqueId });
                        this.addUser(stateUser);
                    } else {
                        console.error(`[ROOM-MANAGER] User ${user.username} not found.`);
                    }
                });
            } else {
                if (this.roomUniqueId.length === 0) {
                    this.roomUniqueId = await this.makeroomUniqueId();
                    console.log(`[ROOM-MANAGER] Room ID generated: ${this.roomUniqueId}`);
                }

                if (!this.roomName || this.roomName.length === 0) {
                    const roomName = "Room-" + Math.random().toString(36).substring(2, 8);
                    console.warn(`[ROOM-MANAGER] Invalid room name input for room ${this.roomUniqueId}, setting to ${roomName}. (Current: ${this.roomName})`);
                    this.roomName = roomName;
                }

                // random 5 numbers code
                this.inviteCode = Math.random().toString().substring(2, 7);
                // add 0 if the generated code is less than 5 characters
                if (this.inviteCode.length < 5) this.inviteCode = "0" + this.inviteCode;

                if (!this.maxPlayers || this.maxPlayers === 0 || this.maxPlayers > 15 || this.maxPlayers < 2 || isNaN(Number(this.maxPlayers))) {
                    console.warn(`[ROOM-MANAGER] Invalid max players input for room ${this.roomUniqueId}, setting to 8. (Current: ${this.maxPlayers})`);
                    this.maxPlayers = 8;
                }

                if (!this.rounds || this.rounds === 0 || this.rounds > 20 || this.rounds < 2 || typeof this.rounds !== 'number') {
                    console.warn(`[ROOM-MANAGER] Invalid rounds input for room ${this.roomUniqueId}, setting to 5. (Current: ${this.rounds})`);
                    this.rounds = 5;
                }

                this.isPrivate = Boolean(this.isPrivate);
                if (!hasProperty(this, 'isPrivate') || typeof this.isPrivate !== 'boolean') {
                    console.warn(`[ROOM-MANAGER] Invalid isPrivate input for room ${this.roomUniqueId}, setting to false. (Current: ${this.isPrivate})`);
                    this.isPrivate = false;
                }

                if (!this.category || this.category.length === 0) {
                    console.warn(`[ROOM-MANAGER] Invalid category input for room ${this.roomUniqueId}, setting to Music. (Current: ${this.category})`);
                    this.category = 'Music';
                }

                if (!this.genre || this.genre.length === 0) {
                    console.warn(`[ROOM-MANAGER] Invalid genre input for room ${this.roomUniqueId}, setting to Pop. (Current: ${this.genre})`);
                    this.genre = 'Pop';
                }

                if (!this.difficulty || this.difficulty === 0 || this.difficulty > 3 || this.difficulty < 1 || typeof this.difficulty !== 'number') {
                    console.warn(`[ROOM-MANAGER] Invalid difficulty input for room ${this.roomUniqueId}, setting to 2. (Current: ${this.difficulty})`);
                    this.difficulty = 2;
                }

                db.createRoom(this.get());
                WSWrapper.send({ route: "room", type: "lobby-refresh", action: "update", data: { room: this.get() } });
            }

            console.log(`[ROOM-MANAGER] Room ${this.roomUniqueId} validated.`);
            // WSWrapper.send({ route: "room", type: 'validate', room: this.get() });
        } catch (e: any) {
            console.error(`[ROOM-MANAGER] Error validating room: ${e.message}`);
            throw e;
        }
    }

    public get(): any {
        return {
            roomUniqueId: this.roomUniqueId,
            roomOwner: this.roomOwner,
            roomName: this.roomName,
            maxPlayers: this.maxPlayers,
            rounds: this.rounds,
            isPrivate: this.isPrivate,
            category: this.category,
            genre: this.genre,
            difficulty: this.difficulty,
            inviteCode: this.inviteCode,
            started: this.started,
            users: this.users.map(u => u.get())
        };
    }

    addUser(user: User): void {
        if (this.users.some(u => u.uniqueId === user.uniqueId)) {
            return console.warn(`[ROOM-MANAGER] The user ${user.getColumn("username")} (${user.getColumn("uniqueId")}) is already in the room. Ignoring the request.`)
        }
        if (!this.users.some(u => u.uniqueId === user.uniqueId)) {
            // get users in room and send ws message to all users in room
            const users = this.users.map(u => u.get());
            this.users.push(user);
            for (const u of users) {
                console.log(`[ROOM-MANAGER] Sending user join message to ${u.username}`);
                WSWrapper.send({ route: "room", type: 'user-join', data: { user: user.get(), room: this.get() } });
            }
        }
        console.log(`[ROOM-MANAGER] ${user.username} has joined the room ${this.roomUniqueId}.`);
        let room = this.get();
        if (room.isPrivate) room.inviteCode = "*****";
        WSWrapper.send({ route: "room", type: "lobby-refresh", action: "update", data: { room } });
        user.update({ column: "userLastRoomPing", value: new Date().toISOString() });
        user.update({ column: "currentRoom", value: this.roomUniqueId });
        db.addUserToRoom(this.getColumn("roomUniqueId"), user.getColumn("uniqueId"));
        // keep this commented, maybe we need it... idk.
        // db.updateUser(user.get());
    }

    removeUser(user: User): void {
        if (this.users.some(u => u.uniqueId === user.uniqueId)) {
            WSWrapper.send({ route: "room", type: 'user-leave', data: { user: user.get(), room: this.get() } });
            this.users = this.users.filter(u => u.uniqueId !== user.uniqueId);
            console.log(`[ROOM-MANAGER] ${user.username} has left the room ${this.roomUniqueId}.`);
        };
        let room = this.get();
        if (room.isPrivate) room.inviteCode = "*****";
        WSWrapper.send({ route: "room", type: "lobby-refresh", action: "update", data: { room } });
        user.update({ column: "currentRoom", value: '' });
        // user.update({ column: "userLastRoomPing", value: new Date().toISOString() });
        db.removeUserFromRoom(this.getColumn("roomUniqueId"), user.getColumn("uniqueId"));
        // keep this commented, maybe we need it... idk.
        // db.updateUser(user.get());
    }

    isInRoom(user: User): boolean {
        return this.users.some(u => u.uniqueId === user.uniqueId);
    }

    isFull(): boolean {
        return this.users.length >= this.maxPlayers;
    }

    isEmpty(): boolean {
        return this.users.length === 0;
    }

    // game section
    start(): boolean {
        if (this.users.length < 2) {
            console.error(`[ROOM-MANAGER] Not enough players to start the game.`);
            return false;
        }
        this.started = true;
        console.log(`[ROOM-MANAGER] Starting game in room ${this.roomUniqueId}`);
        WSWrapper.send({ route: "room", type: 'game-start', data: { room: this.get() } });
        WSWrapper.send({ route: "room", type: "lobby-refresh", action: "update", data: { room: this.get() } });
        return true;
    }
}

export {
    Room
}