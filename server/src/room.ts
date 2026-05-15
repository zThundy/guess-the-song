
import { UserInstance } from '../types/user_types';
import { RoomInstance, UpdateRoom } from '../types/room_types';

import User from './user';
import { hasProperty } from './utils';
import db from './sql';

const { getUser, addUser, removeRoom } = require('./states');
const WSWrapper = require('./wswrapper');
const MusicStreamer = require('./musicstreamer');

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
    // per-room points map keyed by user uniqueId
    public roomPoints: { [uniqueId: string]: number } = {};
    // tracks which users are ready for the next round
    public roundReadyUsers: Set<string> = new Set();
    public currentSongId: string = '';
    public currentSongName: string = '';
    public songStartedAt: number = 0;
    public answerBasePoints: number = 100;
    public answerMinPoints: number = 10;
    public answerDecayPerSecond: number = 12;
    private roomPingUsersInterval: ReturnType<typeof setInterval> | null = null;

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

        this.roomPingUsersInterval = setInterval(() => {
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
                if (this.roomPingUsersInterval) {
                    clearInterval(this.roomPingUsersInterval);
                    this.roomPingUsersInterval = null;
                }
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

        // Listen for ready-for-next-round from clients
        WSWrapper.on("ready-for-next-round", (r: any) => {
            console.log(`[ROOM-MANAGER] Received ready-for-next-round from client for room ${this.roomUniqueId}.`);
            try {
                const data = r?.data || {};
                if (!data.roomUniqueId || data.roomUniqueId !== this.roomUniqueId) return;
                if (!data.uniqueId) return;
                
                this.roundReadyUsers.add(String(data.uniqueId));
                console.log(`[ROOM-MANAGER] User ${data.uniqueId} ready for next round in room ${this.roomUniqueId} (${this.roundReadyUsers.size}/${this.users.length})`);
                
                // Check if all users are ready
                if (this.roundReadyUsers.size >= this.users.length) {
                    // Reset ready set for next round
                    this.roundReadyUsers.clear();
                    this.advanceRound();
                }
            } catch (e: any) {
                console.error(`[ROOM-MANAGER] Error in ready-for-next-round handler: ${e?.message || e}`);
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

    public update(data: UpdateRoom): void {
        try {
            if (data.column in this) {
                console.log(`[ROOM-MANAGER] Updating ${data.column} to ${data.value}`);
                (this as any)[data.column] = data.value;
                // WSWrapper.send({ route: "room", type: 'update', column: key, value: value });
            } else {
                console.error(`[ROOM-MANAGER] Invalid key: ${data.column}`);
            }
        } catch (e: any) {
            console.error(`[ROOM-MANAGER] Error updating field in room manager. ${e.message}`)
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
                    this.update({ column: 'roomName', value: dbRoom.roomName });
                }

                if (dbRoom.roomOwner !== this.roomOwner) {
                    this.update({ column: 'roomOwner', value: dbRoom.roomOwner });
                }

                if (dbRoom.inviteCode !== this.inviteCode) {
                    if (typeof dbRoom.inviteCode !== 'string') dbRoom.inviteCode = String(dbRoom.inviteCode);
                    this.update({ column: 'inviteCode', value: dbRoom.inviteCode });
                }

                if (dbRoom.maxPlayers !== this.maxPlayers) {
                    this.update({ column: 'maxPlayers', value: dbRoom.maxPlayers });
                }

                if (dbRoom.rounds !== this.rounds) {
                    this.update({ column: 'rounds', value: dbRoom.rounds });
                }

                if (dbRoom.isPrivate !== this.isPrivate) {
                    this.update({ column: 'isPrivate', value: dbRoom.isPrivate });
                }

                if (dbRoom.category !== this.category) {
                    this.update({ column: 'category', value: dbRoom.category });
                }

                if (dbRoom.genre !== this.genre) {
                    this.update({ column: 'genre', value: dbRoom.genre });
                }

                if (dbRoom.difficulty !== this.difficulty) {
                    this.update({ column: 'difficulty', value: dbRoom.difficulty });
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
            currentSongId: this.currentSongId,
            currentSongName: this.currentSongName,
            songStartedAt: this.songStartedAt,
            answerBasePoints: this.answerBasePoints,
            answerMinPoints: this.answerMinPoints,
            answerDecayPerSecond: this.answerDecayPerSecond,
            usersPoints: this.users.map(u => ({ uniqueId: u.uniqueId, points: this.roomPoints[String(u.uniqueId)] || 0 })),
            users: this.users.map(u => u.get())
        };
    }

    public setCurrentSong(song: { id: string; name: string }, startedAt: number): void {
        this.currentSongId = String(song.id || '');
        this.currentSongName = String(song.name || '');
        this.songStartedAt = Number(startedAt || 0);
        console.log(`[ROOM-MANAGER] Current song for room ${this.roomUniqueId} set to ${this.currentSongName} (${this.currentSongId}) at ${this.songStartedAt}.`);
    }

    public clearCurrentSong(): void {
        this.currentSongId = '';
        this.currentSongName = '';
        this.songStartedAt = 0;
    }

    public calculateAnswerPoints(playbackMs: number): number {
        const safePlaybackMs = Math.max(0, Number(playbackMs || 0));
        const elapsedSeconds = safePlaybackMs / 1000;
        const rawPoints = this.answerBasePoints - Math.floor(elapsedSeconds * this.answerDecayPerSecond);
        const points = Math.max(this.answerMinPoints, rawPoints);
        console.log(`[ROOM-MANAGER] Calculated points=${points} for room ${this.roomUniqueId} at playbackMs=${safePlaybackMs}.`);
        return points;
    }

    public submitAnswer(user: User, answer: string, playbackMs: number): { correct: boolean; pointsAwarded: number; correctAnswer: string; correctSongId: string } {
        const normalizedAnswer = String(answer || '').trim().toLowerCase();
        const normalizedCorrect = String(this.currentSongName || '').trim().toLowerCase();
        const correct = normalizedAnswer.length > 0 && normalizedCorrect.length > 0 && normalizedAnswer === normalizedCorrect;
        const pointsAwarded = correct ? this.calculateAnswerPoints(playbackMs) : 0;

        if (correct) {
            // Update room-scoped points map for this user
            const uid = String(user.uniqueId || user.getColumn("uniqueId") || '');
            const prev = Number(this.roomPoints[uid] || 0);
            const newPoints = prev + pointsAwarded;
            this.roomPoints[uid] = newPoints;
            console.log(`[ROOM-MANAGER] Correct answer from ${user.username} in room ${this.roomUniqueId}, awarded ${pointsAwarded} points (room total: ${newPoints}).`);
        } else {
            console.log(`[ROOM-MANAGER] Wrong answer from ${user.username} in room ${this.roomUniqueId}. Submitted='${answer}', expected='${this.currentSongName}'.`);
        }

        WSWrapper.send({
            route: "room",
            type: "points-update",
            data: {
                roomUniqueId: this.roomUniqueId,
                usersPoints: this.users.map(u => ({ uniqueId: u.uniqueId, points: this.roomPoints[String(u.uniqueId)] || 0 }))
            },
        });

        return {
            correct,
            pointsAwarded,
            correctAnswer: this.currentSongName,
            correctSongId: this.currentSongId,
        };
    }

    private advanceRound() {
        // Called when all clients are ready for the next round
        try {
            // Increment round counter
            this.currentRound = Number(this.currentRound || 0) + 1;
            console.log(`[ROOM-MANAGER] All players ready. Advancing to round ${this.currentRound} for room ${this.roomUniqueId}.`);

            if (this.currentRound < Number(this.rounds || 0)) {
                // start next round
                console.log(`[ROOM-MANAGER] Starting round ${this.currentRound} for room ${this.roomUniqueId}`);
                const session = MusicStreamer.start(this);

                // notify participants a new round is starting
                const recipientIds = this.users.map(u => String(u.uniqueId));
                try {
                    WSWrapper.sendToUsers({ route: "room", type: 'round-start', data: { roomUniqueId: this.roomUniqueId, room: this.get() } }, recipientIds);
                } catch (e) {
                    WSWrapper.send({ route: "room", type: 'round-start', data: { roomUniqueId: this.roomUniqueId, room: this.get() } });
                }
            } else {
                // reached final round -> end game
                console.log(`[ROOM-MANAGER] Reached final round (${this.currentRound}/${this.rounds}) for room ${this.roomUniqueId}. Ending game.`);
                this.endGame();
            }
        } catch (e: any) {
            console.error(`[ROOM-MANAGER] Error advancing round: ${e?.message || e}`);
        }
    }

    private endGame() {
        try {
            const usersSnapshot = [...this.users];
            const finalLeaderboard = usersSnapshot
                .map((u) => {
                    const uniqueId = String(u.uniqueId || u.getColumn("uniqueId") || "");
                    const pointsBefore = Number(u.points || 0);
                    const roomPoints = Number(this.roomPoints[uniqueId] || 0);

                    return {
                        uniqueId,
                        username: u.username,
                        userImage: u.userImage,
                        pointsBefore,
                        roomPoints,
                        pointsAfter: pointsBefore + roomPoints,
                    };
                })
                .sort((a, b) => {
                    if (b.pointsAfter !== a.pointsAfter) return b.pointsAfter - a.pointsAfter;
                    if (b.roomPoints !== a.roomPoints) return b.roomPoints - a.roomPoints;
                    return String(a.username || "").localeCompare(String(b.username || ""));
                });

            // finalize and persist scores
            this.finalizeScores();

            const recipientIds = usersSnapshot.map(u => String(u.uniqueId));

            // notify participants that game is over before room cleanup
            try {
                WSWrapper.sendToUsers({ route: "room", type: 'game-end', data: { room: this.get(), leaderboard: finalLeaderboard } }, recipientIds);
            } catch (e) {
                WSWrapper.send({ route: "room", type: 'game-end', data: { room: this.get(), leaderboard: finalLeaderboard } });
            }

            // force all room players to leave the room view client-side
            try {
                WSWrapper.sendToUsers({
                    route: "room",
                    type: 'kick-from-room',
                    data: {
                        roomUniqueId: this.roomUniqueId,
                        reason: 'game-finished'
                    }
                }, recipientIds);
            } catch (e) {
                WSWrapper.send({
                    route: "room",
                    type: 'kick-from-room',
                    data: {
                        roomUniqueId: this.roomUniqueId,
                        reason: 'game-finished'
                    }
                });
            }

            // kick all players back to lobby and remove room membership
            usersSnapshot.forEach((u) => {
                try {
                    u.update({ column: "currentRoom", value: '' });
                    db.removeUserFromRoom(this.getColumn("roomUniqueId"), u.getColumn("uniqueId"));
                } catch (e: any) {
                    console.error(`[ROOM-MANAGER] Error removing user ${u?.username} from room ${this.roomUniqueId}: ${e?.message || e}`);
                }
            });

            // mark game stopped and clear room runtime state
            this.update({ column: 'started', value: false });
            this.users = [];
            this.roomPoints = {};
            this.roundReadyUsers.clear();
            this.clearCurrentSong();

            // stop heartbeat timer for this room
            if (this.roomPingUsersInterval) {
                clearInterval(this.roomPingUsersInterval);
                this.roomPingUsersInterval = null;
            }

            // delete room from db/lobby and in-memory state immediately
            this.deleteRoom();
            removeRoom(this.roomUniqueId);
            this.canCleanup = true;
        } catch (e: any) {
            console.error(`[ROOM-MANAGER] Error ending game: ${e?.message || e}`);
        }
    }

    /**
     * Persist all users' current in-room points to the database.
     * Call this at the end of the match to save totals to the user records.
     */
    public finalizeScores(): void {
        try {
            this.users.forEach((u) => {
                try {
                    const uid = String(u.uniqueId || u.getColumn("uniqueId") || '');
                    const roomPts = Number(this.roomPoints[uid] || 0);
                    if (roomPts > 0) {
                        const current = Number(u.points || 0);
                        u.update({ column: 'points', value: current + roomPts });
                    }
                    u.save();
                } catch (e: any) {
                    console.error(`[ROOM-MANAGER] Error saving user ${u.username}: ${e?.message || e}`);
                }
            });
            console.log(`[ROOM-MANAGER] Finalized and saved scores for room ${this.roomUniqueId}.`);
        } catch (e: any) {
            console.error(`[ROOM-MANAGER] Error finalizing scores: ${e?.message || e}`);
        }
    }

    addUser(user: User): void {
        if (this.isInRoom(user)) {
            console.warn(`[ROOM-MANAGER] The user ${user.getColumn("username")} (${user.getColumn("uniqueId")}) is already in the room. Ignoring the request.`)
        } else {
            // get users in room and send ws message to all users in room
            const users = this.users.map(u => u.get());
            this.users.push(user);
            // initialize room-scoped points for this user if not present
            const uid = String(user.uniqueId || user.getColumn("uniqueId") || '');
            if (!this.roomPoints.hasOwnProperty(uid)) {
                this.roomPoints[uid] = 0;
            }
            // Notify existing room members about the join, but send only to room participants
            try {
                const recipientIds = users.map((u: any) => String(u.uniqueId || u.uniqueId));
                WSWrapper.sendToUsers({ route: "room", type: 'user-join', data: { user: user.get(), room: this.get() } }, recipientIds);
            } catch (e) {
                // fallback to broadcast
                users.forEach((u: any) => console.log(`[ROOM-MANAGER] Sending user join message to ${u.username}`));
                WSWrapper.send({ route: "room", type: 'user-join', data: { user: user.get(), room: this.get() } });
            }
            console.log(`[ROOM-MANAGER] ${user.username} has joined the room ${this.roomUniqueId}.`);
            let room = this.get();
            if (room.isPrivate) room.inviteCode = "*****";
            // Notify only room participants for lobby update
            try {
                const recipientIds = this.users.map(u => String(u.uniqueId));
                WSWrapper.sendToUsers({ route: "room", type: "lobby-refresh", action: "update", data: { room } }, recipientIds);
            } catch (e) {
                WSWrapper.send({ route: "room", type: "lobby-refresh", action: "update", data: { room } });
            }
            user.update({ column: "userLastRoomPing", value: new Date().toISOString() });
            user.update({ column: "currentRoom", value: this.roomUniqueId });
            db.addUserToRoom(this.getColumn("roomUniqueId"), user.getColumn("uniqueId"));
            // keep this commented, maybe we need it... idk.
            // db.updateUser(user.get());
        }
    }

    removeUser(user: User): void {
        if (this.isInRoom(user)) {
            // notify remaining participants about the leave
            try {
                const recipientIds = this.users.map(u => String(u.uniqueId));
                WSWrapper.sendToUsers({ route: "room", type: 'user-leave', data: { user: user.get(), room: this.get() } }, recipientIds);
            } catch (e) {
                WSWrapper.send({ route: "room", type: 'user-leave', data: { user: user.get(), room: this.get() } });
            }
            this.users = this.users.filter(u => u.uniqueId !== user.uniqueId);
            console.log(`[ROOM-MANAGER] ${user.username} has left the room ${this.roomUniqueId}.`);
        };
        // remove room-scoped points for this user
        try {
            const uid = String(user.uniqueId || user.getColumn("uniqueId") || '');
            if (this.roomPoints.hasOwnProperty(uid)) delete this.roomPoints[uid];
        } catch (e) {}
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
        // TODO: check if >= is correct. Should be but, meh (?)
        return this.users.length >= this.maxPlayers;
    }

    isEmpty(): boolean {
        return this.users.length === 0;
    }

    userCanJoin(user: User) {
        if (this.isInRoom(user)) {
            return true;
        }
        if (this.started) {
            return false;
        }
        return true;
    }

    // game section
    start(): boolean {
        // TODO: Dev only. Remove "&& false"
        // if (this.users.length < 2) {
        if (this.users.length < 2 && false) {
            console.error(`[ROOM-MANAGER] Not enough players to start the game.`);
            return false;
        }
        if (this.started) {
            console.warn(`[ROOM-MANAGER] Start requested for room ${this.roomUniqueId}, but game is already started. Ignoring duplicate start.`);
            return false;
        }
        this.update({ column: "started", value: true })
        this.currentRound = 0;
        this.roundReadyUsers.clear();
        console.log(`[ROOM-MANAGER] Starting game in room ${this.roomUniqueId}`);
        MusicStreamer.start(this);
        WSWrapper.send({ route: "room", type: 'game-start', data: { room: this.get() } });
        WSWrapper.send({ route: "room", type: "lobby-refresh", action: "update", data: { room: this.get() } });
        return true;
    }
}

export {
    Room
}