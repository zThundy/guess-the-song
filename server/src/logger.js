const path = require("path");
const fs = require("fs");

const logLevel = process.env.LOG_LEVEL || "info";

let logFile = path.join("./", "data", "logs", "stream.log");
let logFolder = path.join("./", "data", "logs");
let internalId = "";
let logStream = null;

checkFolder();
checkFile();
createStream();

internalId = id();
logStream = fs.createWriteStream(logFile, { flags: "a" });
console.log = log;
console.info = info;
console.warn = warn;
console.error = error;

console.log("------------------------- LOG STARTED -------------------------");

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

function rotate() {
    checkFile();
    // rename file
    const date = new Date();
    // create new log file and rename adding date as DD/MM/YYYY HH:MM:SS
    const newFile = path.join(logFolder, `log_${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.txt`);
    // print file rotation
    console.log(`Renaming log file to ${newFile}`);
    // end the stream of the current log file
    logStream.end();
    // rename the current log file to the new path
    fs.renameSync(logFile, newFile);
}

async function writeLog(type, ...args) {
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
    // check if file size is bigger than 50MB
    if (logStream.bytesWritten > 50000000) {
        // rotate log file
        rotate();
    }
}

function log(...args) {
    // if loglevel is verbose, write to log
    if (logLevel === "verbose")
        writeLog("LOG", ...args);
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