
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const DBHandler = require('./sql.ts');
const db = new DBHandler();

const app: Express = express();
const port: number = <number|null|undefined>process.env.HTTP_PORT || 80;
const sport: number = <number|null|undefined>process.env.HTTPS_PORT || 443;

const certs = {
    key: fs.readFileSync(path.join("certs", 'server.key')),
    cert: fs.readFileSync(path.join("certs", 'server.crt'))
};

app.use(express.static(__dirname, { dotfiles: 'allow' } ));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// disable cors
app.use((req: Request, res: Response, next: Function) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


import accountRouter from "./routes/account";
app.use('/account', accountRouter);

https.createServer(certs, app).listen(sport, () => {
    console.log('Server started on https://localhost:' + sport);
});

// redirect http to https
http.createServer((req: Request, res: Response) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url + ":" + sport });
    res.end();
}).listen(port, () => {
    console.log('Server started on http://localhost:' + port);
});