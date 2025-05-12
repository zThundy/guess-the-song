const WebSocketServer = require('websocket').server;

class WSWrapper {
    private ws: any;

    constructor() {
        this.ws = null;
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
                    connection.on('message', (message: any) => {
                        switch (message.type) {
                            case 'utf8':
                                console.log("SOCKET-LOG", 'Received Message: ' + message.utf8Data);
                                connection.sendUTF(message.utf8Data);
                                break;
                            case 'binary':
                                console.log("SOCKET-LOG", 'Received Binary Message of ' + message.binaryData.length + ' bytes');
                                connection.sendBytes(message.binaryData);
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

    send(data: any) {
        if (!this.ws) return console.error("SOCKET-LOG", "WSWrapper not initialized.");

        if (typeof data === "object") data = JSON.stringify(data);

        this.ws.connections.forEach((connection: any) => {
            connection.sendUTF(data);
        });
    }
}

module.exports = new WSWrapper();