import { RegisterBody } from "../types/account_types";

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class SQLiteClass {
    private engine: any = sqlite3;
    private db: any;
    private dbPath: string = path.join("data", 'db.sqlite');

    constructor() {
        this.checkPath();

        this.db = new this.engine.Database(this.dbPath, (err: Error) => {
            if (err) return console.error(err.message);
            this.createTables();
            console.log('Connected to the database.');
        });
    }

    private createTables() {
        const sql = `CREATE TABLE IF NOT EXISTS users (
            uniqueId TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            userImage TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        this.db.run(sql, (err: Error) => {
            if (err) return console.error(err.message);
            console.log('Table users created.');
        });
    }

    private checkPath() {
        // check if dbPath exists, if not create it
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        }

        return this.dbPath;
    }

    public insertUser(body: RegisterBody) {
        const sql = `INSERT INTO users (uniqueId, username, userImage) VALUES (?, ?, ?)`;
        this.db.run(sql, [body.uniqueId, body.username, body.userImage], (err: Error) => {
            if (err) console.error(err.message);
            console.log('User inserted.');
        });
    }

    public validateUser(body: RegisterBody) {
        const sql = `SELECT * FROM users WHERE uniqueId = ?`;
        this.db.get(sql, [body.uniqueId], (err: Error, row: any) => {
            if (err) console.error(err.message);
            if (!row) {
                this.insertUser(body);
            } else {
                const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE uniqueId = ?`;
                this.db.run(query, [body.uniqueId], (err: Error) => {
                    if (err) console.error(err.message);
                    console.log('User logged in.');
                });
            }
        });
    }
}

module.exports = new SQLiteClass();