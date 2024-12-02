const path = require("path");
const fs = require("fs");

const logLevel = process.env.LOG_LEVEL || "info";
let ready = false;

const rotateAt = process.env.LOG_ROTATE_AT || "50MB";

let logFile = path.join("./", "data", "logs", "stream.log");
let logFolder = path.join("./", "data", "logs");
let internalId = "";
let logStream = null;
// make internalId a random id so that we can monitor if the server restarts
internalId = id();

checkFolder();
checkFile();
createStream();

logStream = fs.createWriteStream(logFile, { flags: "a" });
console.log = log;
console.info = info;
console.warn = warn;
console.error = error;

console.log("------------------------- LOG STARTED -------------------------");
console.log(`Log level: ${logLevel}. Log rotation at: ${rotateAt}`);

// make id function where A are letters and 0 are numbers
// 0A00AA0000AAA
function id() {
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

function createStream() {
    logStream = fs.createWriteStream(logFile, { flags: "a" });
}

function checkFolder() {
    // create main data folder (here since this module gets required first)
    if (!fs.existsSync("./data")) fs.mkdirSync("./data");
    // check if folder exists
    if (!fs.existsSync(path.join(logFolder))) fs.mkdirSync(path.join(logFolder));
}

function checkFile() {
    // check if file exists
    if (!fs.existsSync(logFile)) {
        // create file
        fs.writeFileSync(logFile, "");
    }
}

function getMeta() {
    return fs.statSync(logFile);
}

// translate size from string to bytes
function translateSize(size) {
    const sizes = {
        "KB": 1024,
        "MB": 1024 * 1024,
        "GB": 1024 * 1024 * 1024,
        "TB": 1024 * 1024 * 1024 * 1024
    };
    const sizeSplit = size.split("");
    const sizeNumber = parseInt(sizeSplit.slice(0, sizeSplit.length - 2).join(""));
    const sizeType = sizeSplit.slice(sizeSplit.length - 2).join("");
    return sizeNumber * sizes[sizeType];
}

function rotate() {
    return new Promise((resolve, reject) => {
        try {
            // check if file size is bigger than 50MB
            if (getMeta().size > translateSize(rotateAt)) {
                checkFile();
                // rename file
                const date = new Date();
                // create new log file and rename adding date as DD/MM/YYYY HH:MM:SS
                const newFile = path.join(logFolder, `log_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.log`);
                // end the stream of the current log file
                logStream.end();
                // rename the current log file to the new path
                fs.renameSync(logFile, newFile);
                // create a new stream
                createStream();
                // set ready
                ready = true;
                // print file rotation
                console.log(`Renamed log file from ${logFile} to ${newFile}`);
                // resolve
                resolve();
            } else {
                // log to process.stdout
                // process.stdout.write(`[INFO] Log file is ${getMeta().size} bytes, not rotating.\r\n`);
                // set ready
                ready = true;
                // resolve
                resolve();
            }
        } catch (err) {
            reject(err);
        }
    });
}

async function writeLog(type, ...args) {
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
                return JSON.stringify(arg);
            } else {
                return arg;
            }
        });
        // add date to log as DD/MM/YYYY HH:MM:SS
        const date = new Date();
        // check if date is single digit, if so, add a 0 before it
        var dateString = `[${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}/${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getFullYear()} ${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}]`;
        args.unshift(internalId + " | " + dateString);
        // create message
        const message = Array.from(args).join(" ") + "\r\n"
        // write to stdout
        process.stdout.write(`[${type}] ${message}`);
        // write to log file
        logStream.write(`[${type}] ${message}`);
    } catch (err) {
        process.stdout.write(`[ERROR] ${err.message}\r\n`);
    }
}

function log(...args) {
    // check if one of the args is "SQL", if so, write to console.sql
    if (logLevel === "verbose")
        switch (args[0]) {
            case "SQL-LOG":
                // remove SQL-LOG from args
                args = args.filter(arg => arg !== "SQL-LOG");
                writeLog("SQL", ...args);
                break;
            case "EVENTS-LOG":
                // remove EVENTS-LOG from args
                args = args.filter(arg => arg !== "EVENTS-LOG");
                writeLog("EVENTS", ...args);
                break;
            case "SOCKET-LOG":
                // remove SOCKET-LOG from args
                args = args.filter(arg => arg !== "SOCKET-LOG");
                writeLog("SOCKET", ...args);
                break;
            default:
                // if loglevel is verbose, write to log
                writeLog("LOG", ...args);
                break;
        }
}

function info(...args) {
    writeLog("INFO", ...args);
}

function warn(...args) {
    // if loglevel is verbose or warn, write to log
    if (logLevel === "verbose" || logLevel === "warn")
        writeLog("WARN", ...args);
}

function error(...args) {
    // if loglevel is verbose or error, write to log
    if (logLevel === "verbose" || logLevel === "error")
        writeLog("ERROR", ...args);
}

module.exports = {
    log,
    info,
    warn,
    error
};