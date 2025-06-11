const WebSocketServer = require('websocket').server;
const { standardOut } = require("./logger.js");
import { addUser, getUser } from './states';
import { connection } from '../types/websocket_types';
import User from './user';

class WSWrapper {
    private ws: any;
    private listeners: { [key: string]: Function[] };
    private connections: Map<string, any>;

    constructor() {
        this.ws = null;
        this.listeners = {};
        this.connections = new Map();
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
        try {
            console.log("SOCKET-LOG", "Initializing WSWrapper.");

            // WebSocket server
            this.ws = new WebSocketServer({
                httpServer: sServer,
                // If this is true, websocket connections will be accepted regardless of the path and protocol specified by the client. The protocol accepted will be the first that was requested by the client. Clients from any origin will be accepted. This should only be used in the simplest of cases. You should probably leave this set to false; and inspect the request object to make sure it's acceptable before accepting it.
                autoAcceptConnections: false,
                fragmentOutgoingMessages: true,
                keepalive: true,
                keepaliveInterval: 20000,
                dropConnectionOnKeepaliveTimeout: true,
                // The amount of time to wait after sending a keepalive ping before closing the connection if the connected peer does not respond. Ignored if keepalive or dropConnectionOnKeepaliveTimeout are false. The grace period timer is reset when any data is received from the client.
                keepaliveGracePeriod: 10000,
                // The number of milliseconds to wait after sending a close frame for an acknowledgement to come back before giving up and just closing the socket.
                closeTimeout: 2000,
                // The Nagle Algorithm makes more efficient use of network resources by introducing a small delay before sending small packets so that multiple messages can be batched together before going onto the wire. This however comes at the cost of latency, so the default is to disable it. If you don't need low latency and are streaming lots of small messages, you can change this to 'false';
                disableNagleAlgorithm: true,
                // Whether or not the X-Forwarded-For header should be respected. It's important to set this to 'true' when accepting connections from untrusted clients, as a malicious client could spoof its IP address by simply setting this header. It's meant to be added by a trusted proxy or other intermediary within your own infrastructure. More info: X-Forwarded-For on Wikipedia http://en.wikipedia.org/wiki/X-Forwarded-For
                ignoreXForwardedFor: true,
                // Whether or not to parse 'sec-websocket-extension' headers. Array is exposed to WebSocketRequest.requestedExtensions.
                parseExtensions: true,
                // Whether or not to parse 'cookie' headers. Array is exposed to WebSocketRequest.cookies.
                parseCookies: true,
            });

            this.registerHandlers();

            sServer.on('upgrade', (request: any, socket: any, head: any) => {
                try {
                    console.log("SOCKET-LOG", "Got upgrade request.");

                    socket.on("error", (e: any) => {
                        console.error("SOCKET-LOG", "Error in WSWrapper:", e.message);
                    });

                    socket.on("connect", (e: any) => {
                        console.log("SOCKET-LOG", "WSWrapper socket upgrade connected.");
                    })
                } catch (e: any) {
                    console.error("SOCKET-LOT", "Error during upgrade request.", e.message);
                }
            });

            return this;
        } catch (e: any) {
            console.error("SOCKET-LOG", "Socket init crash.", e.message)
        }
    }

    private registerHandlers() {
        return new Promise((resolve, reject) => {
            this.ws.on('request', (request: any) => {
                try {
                    if (!this.originIsAllowed(request)) {
                        // Make sure we only accept requests from an allowed origin
                        request.reject();
                        console.log("SOCKET-LOG", `Connection from origin ${request.origin} rejected.`);
                        return;
                    } else {
                        console.log("SOCKET-LOG", `Connection from origin ${request.origin} accepted.`);
                    }

                    const connection = request.accept("sg-protocol", request.origin);
                    this.createConnectionHandlers(connection);

                    resolve("WSWrapper initialized.");
                } catch (e: any) {
                    reject(e);
                    console.error("SOCKET-LOG", "Error in WSWrapper:", e.message);
                }
            });
        });
    }

    private createConnectionHandlers(connection: any) {
        try {
            console.log("SOCKET-LOG", `Creating connection handlers.`);
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
                                        console.debug("SOCKET-LOG", 'Received unknown message type: ' + data.type + ". Calling listeners for this type.");
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
        } catch (e: any) {
            console.error("SOCKET-LOG", "Error creating the connection handlers.", e.message);
        }
    }

    public on(event: string, callback: Function) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);
    }

    public off(event: string, callback: Function) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter((cb: Function) => cb !== callback);
        }
    }

    public send(data: any) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        if (typeof data === "object") {
            data.serverTime = new Date().toISOString();
            data = JSON.stringify(data);
        }

        this.ws.connections.forEach((connection: connection) => {
            console.log("SOCKET-LOG", `Sending data to ${connection.socket.remoteAddress}`)
            connection.sendUTF(data);
        });
    }

    public sendTo(data: any, ip: string) {
        if (!this.ws) return console.error("SOCKET-LOG", "Trying to send data to IP but WSWrapper is not initialized.");
        if (!ip || ip.length === 0) return console.error("SOCKET-LOG", "Trying to send data to IP but no IP was provided.")

        if (typeof data === "object") {
            data.serverTime = new Date().toISOString();
            data = JSON.stringify(data);
        }

        this.ws.connections.forEach((connection: connection) => {
            console.log("SOCKET-LOG", `Sending data to ${connection.socket.remoteAddress}`)
            connection.sendUTF(data);
        });
    }
}

module.exports = new WSWrapper();