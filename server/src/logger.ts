import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const logLevel: string = process.env.LOG_LEVEL || "info";
let ready = false;

const rotateAt: string = process.env.LOG_ROTATE_AT || "50MB";

let logFile: string = path.join("./", "data", "logs", "stream.log");
let logFolder: string = path.join("./", "data", "logs");
let internalId: string = "";
let logStream: fs.WriteStream | null = null;
// make internalId a random id so that we can monitor if the server restarts
internalId = id();

checkFolder();
checkFile();
createStream();

logStream = fs.createWriteStream(logFile, { flags: "a" });
console.log = (...args: any[]) => log(...args);
console.info = (...args: any[]) => info(...args);
console.warn = (...args: any[]) => warn(...args);
console.error = (...args: any[]) => error(...args);
console.debug = (...args: any[]) => verbose(...args);

console.info("------------------------- LOG STARTED -------------------------");
console.info(`Log level: ${logLevel} (env is ${process.env.LOG_LEVEL}). Log rotation at: ${rotateAt}`);

// make id function where A are letters and 0 are numbers
// 0A00AA0000AAA
function id(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let id = "";
    for (let i = 0; i < 12; i++) {
        if (i == 1 || i == 4) {
            id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        } else {
            id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
    }
    return id;
}

function createStream(): void {
    if (logStream) logStream.end();
    logStream = fs.createWriteStream(logFile, { flags: "a" });
}

function checkFolder(): void {
    // create main data folder (here since this module gets required first)
    if (!fs.existsSync("./data")) fs.mkdirSync("./data");
    // check if folder exists
    if (!fs.existsSync(path.join(logFolder))) fs.mkdirSync(path.join(logFolder));
}

function checkFile(): void {
    // check if file exists
    if (!fs.existsSync(logFile)) {
        // create file
        fs.writeFileSync(logFile, "");
    }
}

function getMeta(): fs.Stats {
    return fs.statSync(logFile);
}

// translate size from string to bytes
function translateSize(size: string): number {
    const sizes: Record<string, number> = {
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024
    };
    if (!size || size.length < 3) size = "50MB";
    const unit = size.slice(-2).toUpperCase();
    const num = parseInt(size.slice(0, -2), 10) || 50;
    const multiplier = sizes[unit] || sizes.MB;
    return num * multiplier;
}

function rotate(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            if (getMeta().size > translateSize(rotateAt)) {
                checkFile();
                const date = new Date();
                const newFile = path.join(
                    logFolder,
                    `log_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.log`
                );
                if (logStream) logStream.end();
                fs.renameSync(logFile, newFile);
                createStream();
                ready = true;
                // use stdout directly to avoid recursion with overridden console.log
                process.stdout.write(`Renamed log file from ${logFile} to ${newFile}\r\n`);
                resolve();
            } else {
                ready = true;
                resolve();
            }
        } catch (err) {
            reject(err);
        }
    });
}

async function writeLog(type: string, shouldSystemPrint: boolean, ...args: any[]): Promise<void> {
    try {
        // rotate log file
        await rotate();
        // wait for ready
        if (!ready) {
            let tries = 0;
            do {
                tries++;
                if (tries > 10) throw new Error("Could not rotate log file");
                await new Promise((resolve) => setTimeout(resolve, 100));
            } while (!ready);
        }
        // check if args have array or object, if so, stringify it
        args = args.map(arg => {
            if (typeof arg === "object") {
                try { return JSON.stringify(arg); } catch { return String(arg); }
            } else {
                return String(arg);
            }
        });
        // add date to log as DD/MM/YYYY HH:MM:SS
        const date = new Date();
        // check if date is single digit, if so, add a 0 before it
        var dateString = `[${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}/${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getFullYear()} ${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}]`;
        args.unshift(internalId + " | " + dateString);
        // create message
        const message = Array.from(args).join(" ") + "\r\n";
        // write to stdout
        if (shouldSystemPrint) process.stdout.write(`[${type}] ${message}`);
        // write to log file
        if (logStream) logStream.write(`[${type}] ${message}`);
    } catch (err) {
        const e: any = err;
        process.stdout.write(`[ERROR] ${e && e.message ? e.message : String(e)}\r\n`);
    }
}

function log(...args: any[]): void {
    // handle special tags when verbose
    if (logLevel === "verbose") {
        const first = typeof args[0] === 'string' ? args[0] : null;
        if (first === "SQL-LOG") {
            args = args.slice(1);
            writeLog("SQL", true, ...args);
            return;
        }
        if (first === "EVENTS-LOG") {
            args = args.slice(1);
            writeLog("EVENTS", true, ...args);
            return;
        }
        if (first === "SOCKET-LOG") {
            args = args.slice(1);
            writeLog("SOCKET", true, ...args);
            return;
        }
        writeLog("LOG", true, ...args);
        return;
    }
    // default behavior when not verbose: log normally
    writeLog("LOG", true, ...args);
}

function info(...args: any[]): void {
    writeLog("INFO", true, ...args);
}

function warn(...args: any[]): void {
    // if loglevel is verbose or warn, write to log
    if (logLevel === "verbose" || logLevel === "warn") writeLog("WARN", true, ...args);
}

function error(...args: any[]): void {
    // if loglevel is verbose or error, write to log
    if (logLevel === "verbose" || logLevel === "error") writeLog("ERROR", true, ...args);
}

function verbose(...args: any[]): void {
    if (logLevel === "verbose") writeLog("VERBOSE", false, ...args);
}

function standardOut(...args: any[]): void {
    if (logLevel === "verbose") process.stdout.write(args.join(' '));
}

export { log, info, warn, error, standardOut };