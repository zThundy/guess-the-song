
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const { } = require('./logger');

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app: Express = express();
const port: number | string = <string | number | null | undefined>process.env.HTTP_PORT || "80";
const sport: number | string = <string | number | null | undefined>process.env.HTTPS_PORT || "443";

const certs = {
    key: fs.readFileSync(path.join("certs", 'server.key')),
    cert: fs.readFileSync(path.join("certs", 'server.crt'))
};

app.use(express.static(__dirname, { dotfiles: 'allow' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// disable cors
app.use((req: Request, res: Response, next: Function) => {
    // res.header("X-Powered-By", "Express, SongGuesser");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// this is a trivial implementation
app.use((err: any, req: Request, res: Response, next: Function) => {
    // you can error out to stderr still, or not; your choice
    console.error(err.message);
    // body-parser will set this to 400 if the json is in error
    if (err.status === 400) return res.status(err.status).json({ message: 'Invalid JSON body in the request' });
    if (err.status === 404) return res.status(err.status).json({ message: 'Not found' });
    if (err.status === 500) return res.status(err.status).json({ message: 'Internal server error' });

    return next(err); // if it's not a 400, let the default error handling do it. 
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'It works!' });
});

import accountRouter from "./routes/account";
app.use('/account', accountRouter);
import roomsRouter from "./routes/rooms";
app.use('/rooms', roomsRouter);

https.createServer(certs, app).listen(sport, () => {
    console.info('Server started on https://localhost:' + sport);
});

// redirect http to https
http.createServer((req: Request, res: Response) => {
    const host = (req.headers.host || '').replace(/:\d+/, ':' + sport);
    // change port to https port
    const url = 'https://' + host + req.url;
    console.log('Redirecting to ' + url);
    res.writeHead(301, { 'Location': url });
    res.end();
}).listen(port, () => {
    console.info('Server started on http://localhost:' + port);
});