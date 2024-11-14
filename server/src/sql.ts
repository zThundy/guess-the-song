
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
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the database.');
        });
    }

    private checkPath() {
        // check if dbPath exists, if not create it
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        }

        return this.dbPath;
    }
}

module.exports = SQLiteClass;