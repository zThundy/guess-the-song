const WebSocketServer = require('websocket').server;
import { addUser, getUser } from './states';
import User from './user';

class WSWrapper {
    private ws: any;
    private listeners: { [key: string]: Function[] };

    constructor() {
        this.ws = null;
        this.listeners = {};
    }

    private originIsAllowed(request: any) {
        console.log("SOCKET-LOG", "Checking origin:", request.origin);
        console.log("SOCKET-LOG", "Request headers:", request.httpRequest.headers);
        console.log("SOCKET-LOG", "Request header protocol:", request.httpRequest.headers['sec-websocket-protocol']);

        if (!request.httpRequest.headers['sec-websocket-protocol'] || request.httpRequest.headers['sec-websocket-protocol'] !== "sg-protocol") {
            console.log("SOCKET-LOG", "Invalid protocol, rejecting connection.");
            return false;
        }

        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    init(sServer: any) {
        console.log("SOCKET-LOG", "Initializing WSWrapper.");

        // WebSocket server
        this.ws = new WebSocketServer({
            httpServer: sServer,
            autoAcceptConnections: false
        });

        this.registerHandlers();

        sServer.on('upgrade', (request: any, socket: any, head: any) => {
            console.log("SOCKET-LOG", "Got upgrade request.");

            socket.on("error", (e: any) => {
                console.error("SOCKET-LOG", "Error in WSWrapper:", e.message);
            });

            socket.on("close", (e: any) => {
                console.log("SOCKET-LOG", "WSWrapper socket closed.");
            });
        });

        return this;
    }

    registerHandlers() {
        return new Promise((resolve, reject) => {
            this.ws.on('request', (request: any) => {
                try {
                    if (!this.originIsAllowed(request)) {
                        // Make sure we only accept requests from an allowed origin
                        request.reject();
                        console.log("SOCKET-LOG", 'Connection from origin ' + request.origin + ' rejected.');
                        return;
                    } else {
                        console.log("SOCKET-LOG", 'Connection from origin ' + request.origin + ' accepted.');
                    }

                    const connection = request.accept("sg-protocol", request.origin);
                    connection.on('message', async (message: any) => {
                        switch (message.type) {
                            case 'utf8':
                                try {
                                    // console.log("SOCKET-LOG", 'Received UTF8 Message: ' + message.utf8Data);
                                    // decode utf8 from json
                                    let data = JSON.parse(message.utf8Data);
                                    // check if data is an object
                                    if (typeof data === "object") {
                                        // check if data has a route
                                        switch (data.type) {
                                            case 'ping':
                                                if (data.data && data.data.user) {
                                                    connection.sendUTF(JSON.stringify({ type: 'pong', data: { time: new Date() } }));
                                                    let user = getUser(data.data.user);
                                                    if (!user) {
                                                        user = new User(data.data.user, data.data.username, data.data.userImage);
                                                        await user.validateUser()
                                                        addUser(user);
                                                    } else {
                                                        let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                                                        // console.log("SOCKET-LOG", 'Updating user last_login to: ' + date);
                                                        user.update({ column: 'last_login', value: date });
                                                    }
                                                } else {
                                                    // connection.sendUTF(JSON.stringify({ type: 'pong' }));
                                                    console.log("SOCKET-LOG", 'Received ping message without user data. Ignoring.');
                                                }
                                                break;
                                            default:
                                                console.log("SOCKET-LOG", 'Received unknown message type: ' + data.type + ". Calling listeners for this type.");
                                                this.listeners[data.type]?.forEach((callback: Function) => {
                                                    try {
                                                        callback(data);
                                                    } catch (e: any) {
                                                        console.error("SOCKET-LOG", "Error in WSWrapper message handler:", e.message);
                                                    }
                                                });
                                                break;
                                        }

                                    } else {
                                        console.log("SOCKET-LOG", 'Received non-object data: ' + message.utf8Data);
                                    }
                                } catch (e: any) {
                                    console.error("SOCKET-LOG", "Error in WSWrapper:", e.message);
                                }
                                break;
                            case 'binary':
                                console.log("SOCKET-LOG", 'Received Binary Message of ' + message.binaryData.length + ' bytes');
                                connection.sendBytes(message.binaryData);
                                break;
                            default:
                                console.log("SOCKET-LOG", 'Received Unknown (Default) Message Type: ' + message.type);
                                break;
                        }
                    });

                    connection.on('close', (reasonCode: any, description: any) => {
                        console.log("SOCKET-LOG", 'Peer ' + connection.remoteAddress + ' disconnected.');
                    });

                    resolve("WSWrapper initialized.");
                } catch (e: any) {
                    reject(e);
                    // console.error("SOCKET-LOG", "Error in WSWrapper:", e.message);
                }
            });
        });
    }

    on(event: string, callback: Function) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);
    }

    off(event: string, callback: Function) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter((cb: Function) => cb !== callback);
        }
    }

    send(data: any) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        if (typeof data === "object") {
            data.serverTime = new Date().toISOString();
            data = JSON.stringify(data);
        }

        this.ws.connections.forEach((connection: any) => {
            connection.sendUTF(data);
        });
    }
}

module.exports = new WSWrapper();