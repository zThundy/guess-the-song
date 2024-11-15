import {
    RegisterBody,
    TableTransactions,
    AlterTableTransactions,
    DeleteUsers
} from "../types/account_types";

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const nodeCron = require('node-cron');

class SQLiteClass {
    private engine: any = sqlite3;
    private db: any;
    private dbPath: string = path.join("data", 'db.sqlite');
    private userIds: string[] = [];

    private transactions: TableTransactions = [
        `CREATE TABLE IF NOT EXISTS users (
            uniqueId TEXT PRIMARY KEY
        )`,

        `CREATE TABLE IF NOT EXISTS userData (
            uniqueId TEXT PRIMARY KEY
        )`,
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
        }
    ]

    private deleteUsers: DeleteUsers = [
        `DELETE FROM users WHERE last_login < datetime('now', '-1 month')`,
        `DELETE FROM userData WHERE uniqueId NOT IN (SELECT uniqueId FROM users)`,
    ]

    constructor() {
        this.checkPath();

        this.db = new this.engine.cached.Database(this.dbPath, (err: Error) => {
            if (err) return console.error(err.message);
            try {
                this.initDb();
                console.log('Connected to the database.');
            } catch (err: any) {
                console.error(err.message);
            }
        });

        // every 1 hour, delete users that haven't logged in for a month
        nodeCron.schedule('0 * * * *', () => {
            // nodeCron.schedule('*/1 * * * *', () => {
            console.log('Running cron job.');
            this.deleteUsers.forEach(async (sql: string) => {
                try {
                    await this.syncRun(sql);
                } catch (err: any) {
                    console.error(err.message);
                }
            });
        });
    }

    syncRun(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, (err: Error) => {
                if (err) return reject(err);
                console.log("Executed: " + sql);
                resolve(sql);
            });
        });
    }
    
    syncGet(sql: string, params: any[] = []): Promise<{result: any, hasData: boolean}> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err: Error, result: any) => {
                if (err) return reject(err);
                console.log("Executed: " + sql + " with params: " + params);
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

        const sql = `SELECT uniqueId FROM users`;
        const data = await this.syncGet(sql);
        const result = data.result;
        this.userIds = result.map((row: any) => row.unique);
    }

    private checkPath() {
        // check if dbPath exists, if not create it
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        }

        return this.dbPath;
    }

    private makeUserId(): string {
        let userId = Math.random().toString(36).substring(2, 21);
        if (this.userIds.includes(userId)) {
            console.log(`User ID ${userId} already exists. Generating new one.`);
            return this.makeUserId();
        }
        console.log(`Generated user ID: ${userId}`);
        return userId;
    }

    public insertUser(body: RegisterBody): RegisterBody {
        if (body.uniqueId.length === 0) body.uniqueId = this.makeUserId();
        this.userIds.push(body.uniqueId);
        
        const sql = `INSERT INTO users (uniqueId, username, userImage) VALUES (?, ?, ?)`;
        this.db.run(sql, [body.uniqueId, body.username, body.userImage], (err: Error) => {
            if (err) console.error(err.message);
            console.log('User inserted.');
        });

        const userData = `INSERT INTO userData (uniqueId) VALUES (?)`;
        this.db.run(userData, [body.uniqueId], (err: Error) => {
            if (err) console.error(err.message);
            console.log('User data inserted.');
        });

        return body;
    }

    public updateImage(body: RegisterBody) {
        // update userimage and last_login
        const sql = `UPDATE users SET userImage = ?, last_login = CURRENT_TIMESTAMP WHERE uniqueId = ?`;
        this.db.run(sql, [body.userImage, body.uniqueId], (err: Error) => {
            if (err) console.error(err.message);
            console.log('User image updated.');
        });
    }

    public async validateUser(body: RegisterBody): Promise<RegisterBody|undefined> {
        try {
            const sql = `SELECT * FROM users WHERE uniqueId = ?`;
            const data = await this.syncGet(sql, [body.uniqueId]);

            if (!data.hasData) {
                console.log('User not found. Inserting user.');
                body = this.insertUser(body);
            } else {
                const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE uniqueId = ?`;
                this.db.run(query, [body.uniqueId], (err: Error) => {
                    if (err) console.error(err.message);
                    console.log('User logged in.');
                });
                
                body.username = data.result[0].username;
                body.userImage = data.result[0].userImage;
            }

            const formatted = new Date().toISOString().slice(0, 19).replace('T', ' ');
            body.created = data.result[0]?.created_at || formatted;
            body.last_login = data.result[0]?.last_login || formatted;
            
            return body;
        } catch (err: any) {
            console.error(err.message);
        }
    }
}

module.exports = new SQLiteClass();