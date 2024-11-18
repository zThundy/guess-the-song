import {
    RegisterBody,
    TableTransactions,
    AlterTableTransactions,
    DeleteUsers
} from "../types/account_types";
import { UserInstance } from "../types/user_types";
import { RoomInstance } from "../types/room_types";

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const nodeCron = require('node-cron');
const SHOULD_LOG = process.env.SHOULD_LOG_DB === 'true';

class SQLiteClass {
    private engine: any = sqlite3;
    private db: any;
    private dbPath: string = path.join("data", 'db.sqlite');

    private transactions: TableTransactions = [
        `CREATE TABLE IF NOT EXISTS users (uniqueId TEXT PRIMARY KEY)`,
        `CREATE TABLE IF NOT EXISTS userData (uniqueId TEXT PRIMARY KEY)`,
        `CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY, roomUniqueId TEXT UNIQUE)`,
        `CREATE TABLE IF NOT EXISTS roomUsers (roomUniqueId TEXT, uniqueId TEXT)`,
    ];

    private alterTable: AlterTableTransactions = [
        {
            table: 'users',
            column: 'username',
            type: 'TEXT',
            default: '""'
        },
        {
            table: 'users',
            column: 'userImage',
            type: 'TEXT',
            default: '""'
        },
        {
            table: 'users',
            column: 'last_login',
            type: 'TIMESTAMP',
            default: 'CURRENT_TIMESTAMP'
        },
        {
            table: "users",
            column: "created_at",
            type: "TIMESTAMP",
            default: "CURRENT_TIMESTAMP"
        },
        {
            table: 'userData',
            column: 'points',
            type: 'INTEGER',
            default: '0'
        },
        {
            table: 'userData',
            column: 'level',
            type: 'INTEGER',
            default: '0'
        },
        {
            table: "rooms",
            column: "roomOwner",
            type: "TEXT",
            default: '""'
        },
        {
            table: "rooms",
            column: "inviteCode",
            type: "INTEGER",
            default: '00000'
        },
        {
            table: "rooms",
            column: "roomName",
            type: "TEXT",
            default: '""'
        },
        {
            table: "rooms",
            column: "maxPlayers",
            type: "INTEGER",
            default: '2'
        },
        {
            table: "rooms",
            column: "rounds",
            type: "INTEGER",
            default: '2'
        },
        {
            table: "rooms",
            column: "isPrivate",
            type: "BOOLEAN",
            default: '0'
        },
        {
            table: "rooms",
            column: "category",
            type: "TEXT",
            default: '""'
        },
        {
            table: "rooms",
            column: "genre",
            type: "TEXT",
            default: '""'
        },
        {
            table: "rooms",
            column: "difficulty",
            type: "INTEGER",
            default: '1'
        },
        {
            table: "rooms",
            column: "created_at",
            type: "TIMESTAMP",
            default: "CURRENT_TIMESTAMP"
        }
    ]

    private deleteUsers: DeleteUsers = [
        `DELETE FROM users WHERE last_login < datetime('now', '-1 month')`,
        // `DELETE FROM users WHERE last_login < datetime('now', '-1 second')`,
        `DELETE FROM userData WHERE uniqueId NOT IN (SELECT uniqueId FROM users)`,
    ]

    constructor() {
        this.checkPath();

        this.db = new this.engine.cached.Database(this.dbPath, (err: Error) => {
            if (err) return console.error(err.message);
            try {
                if (SHOULD_LOG) console.log("SQL-LOG", 'Connected to the database.');
                this.initDb();
            } catch (err: any) {
                console.error(err.message);
            }
        });

        // every 1 hour, delete users that haven't logged in for a month
        nodeCron.schedule('0 * * * *', () => {
            if (SHOULD_LOG) console.log("SQL-LOG", 'Running cron job.');
            this.deleteUsers.forEach(async (sql: string) => {
                try {
                    await this.syncRun(sql);
                } catch (err: any) {
                    console.error(err.message);
                }
            });
        });
    }

    private checkPath() {
        // check if dbPath exists, if not create it
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        }

        return this.dbPath;
    }

    private syncRun(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err: Error) => {
                if (err) return reject(err);
                if (SHOULD_LOG) console.log("SQL-LOG", "Executed: " + sql + " with params: " + params);
                resolve(sql);
            });
        });
    }

    private syncGet(sql: string, params: any[] = []): Promise<{ result: any, hasData: boolean }> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err: Error, result: any) => {
                if (err) return reject(err);
                if (SHOULD_LOG) console.log("SQL-LOG", "Executed: " + sql + " with params: " + params);
                const hasData = result.length > 0;
                resolve({ result, hasData });
            });
        });
    }

    private async initDb(): Promise<void> {
        for (let i = 0; i < this.transactions.length; i++) {
            try {
                const sql = this.transactions[i];
                await this.syncRun(sql);
            } catch (err: any) {
                console.error(err.message);
            }
        }

        for (let obj of this.alterTable) {
            try {
                const sql = `ALTER TABLE ${obj.table} ADD COLUMN ${obj.column} ${obj.type} DEFAULT ${obj.default}`;
                await this.syncRun(sql);
            } catch (err: any) {
                console.error(err.message);
            }
        }
    }

    /**
     * PUBLIC METHODS
     */

    // ROOMS

    public async createRoom(room: RoomInstance): Promise<void> {
        try {
            const sql = `INSERT INTO rooms (roomUniqueId, roomOwner, inviteCode, roomName, maxPlayers, rounds, isPrivate, category, genre, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await this.syncRun(sql, [room.roomUniqueId, room.roomOwner, room.inviteCode, room.roomName, room.maxPlayers, room.rounds, room.isPrivate, room.category, room.genre, room.difficulty]);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    public async getRoom(roomUniqueId: string): Promise<any> {
        try {
            const query = `SELECT * FROM rooms WHERE roomUniqueId = ?`;
            const data = await this.syncGet(query, [roomUniqueId]);
            return data.result;
        } catch (err: any) {
            console.error(err.message);
        }

        return [];
    }

    /**
     * 
     * @param offset number
     * @returns the first 10 rooms in the database that you can offset
     */
    public async getRooms(offset: number | string): Promise<any> {
        try {
            // select first 10 rooms from the database
            const query = `SELECT * FROM rooms ORDER BY created_at DESC LIMIT 10 OFFSET ?`;
            const data = await this.syncGet(query, [offset]);
            return data.result;
        } catch (err: any) {
            console.error(err.message);
        }

        return [];
    }

    public async deleteRoom(roomUniqueId: string): Promise<void> {
        try {
            const query = `DELETE FROM rooms WHERE roomUniqueId = ?`;
            await this.syncRun(query, [roomUniqueId]);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    public async addUserToRoom(roomUniqueId: string, uniqueId: string): Promise<void> {
        try {
            const query = `INSERT INTO roomUsers (roomUniqueId, uniqueId) VALUES (?, ?)`;
            await this.syncRun(query, [roomUniqueId, uniqueId]);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    public async removeUserFromRoom(roomUniqueId: string, uniqueId: string): Promise<void> {
        try {
            const query = `DELETE FROM roomUsers WHERE roomUniqueId = ? AND uniqueId = ?`;
            await this.syncRun(query, [roomUniqueId, uniqueId]);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    public async getUsersInRoom(roomUniqueId: string): Promise<any> {
        try {
            const query = `SELECT * FROM roomUsers WHERE roomUniqueId = ?`;
            const data = await this.syncGet(query, [roomUniqueId]);
            return data.result;
        } catch (err: any) {
            console.error(err.message);
        }

        return [];
    }

    public async doesRoomExist(roomUniqueId: string): Promise<boolean> {
        try {
            const query = `SELECT * FROM rooms WHERE roomUniqueId = ?`;
            const data = await this.syncGet(query, [roomUniqueId]);
            return data.hasData;
        } catch (err: any) {
            console.error(err.message);
        }

        return false;
    }

    // USERS

    public async insertUser(body: RegisterBody): Promise<void> {
        try {
            const sql = `INSERT INTO users (uniqueId, username, userImage) VALUES (?, ?, ?)`;
            await this.syncRun(sql, [body.uniqueId, body.username, body.userImage]);

            const userData = `INSERT INTO userData (uniqueId) VALUES (?)`;
            await this.syncRun(userData, [body.uniqueId]);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    public async doesUserExist(uniqueId: string): Promise<boolean> {
        try {
            const sql = `SELECT * FROM users WHERE uniqueId = ?`;
            const data = await this.syncGet(sql, [uniqueId]);
            return data.hasData;
        } catch (err: any) {
            console.error(err.message);
        }

        return false;
    }

    public async loginUser(uniqueId: string): Promise<void> {
        try {
            const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE uniqueId = ?`;
            this.db.run(query, [uniqueId], (err: Error) => {
                if (err) console.error(err.message);
                if (SHOULD_LOG) console.log("SQL-LOG", 'User logged in.');
            });
        } catch (err: any) {
            console.error(err.message);
        }
    }

    public async getUser(uniqueId: string): Promise<any> {
        try {
            const query = `SELECT * FROM users WHERE uniqueId = ?`;
            const data = await this.syncGet(query, [uniqueId]);
            return data.result;
        } catch (err: any) {
            console.error(err.message);
        }

        return [];
    }

    public async getUserData(uniqueId: string): Promise<any> {
        try {
            const query = `SELECT * FROM userData WHERE uniqueId = ?`;
            const data = await this.syncGet(query, [uniqueId]);
            return data.result;
        } catch (err: any) {
            console.error(err.message);
        }

        return [];
    }

    public createUser(data: UserInstance) {
        const sql = `INSERT INTO users (uniqueId, username, userImage, created_at, last_login) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        this.db.run(sql, [data.uniqueId, data.username, data.userImage], (err: Error) => {
            if (err) console.error(err.message);
            if (SHOULD_LOG) console.log("SQL-LOG", 'User created.');
        });

        const userData = `INSERT INTO userData (uniqueId, points, level) VALUES (?, 0, 0)`;
        this.db.run(userData, [data.uniqueId], (err: Error) => {
            if (err) console.error(err.message);
            if (SHOULD_LOG) console.log("SQL-LOG", 'User data created.');
        });
    }

    public async updateUser(data: UserInstance) {
        const sql = `UPDATE users SET username = ?, userImage = ? WHERE uniqueId = ?`;
        await this.syncRun(sql, [data.username, data.userImage, data.uniqueId]);
        // this.db.run(sql, [data.username, data.userImage, data.uniqueId], (err: Error) => {
        //     if (err) console.error(err.message);
        //     if (SHOULD_LOG) console.log("SQL-LOG", 'User updated.');
        // });
    }

    public async updateUserData(data: UserInstance) {
        const sql = `UPDATE userData SET points = ?, level = ? WHERE uniqueId = ?`;
        await this.syncRun(sql, [data.points, data.level, data.uniqueId]);
        // this.db.run(sql, [data.points, data.level, data.uniqueId], (err: Error) => {
        //     if (err) console.error(err.message);
        //     if (SHOULD_LOG) console.log("SQL-LOG", 'User data updated.');
        // });
    }
}

export default new SQLiteClass();