
class WSWrapper {
    constructor() {
        this.connection = null;
        this.listeners = new Map();
        this.debug = true; // Set to true to enable debug logging
        this._log('WebSocketWrapper initialized');

        setInterval(() => {
            console.debug("[WEBSOCKET] Registered listeners are: ", this.listeners);
        }, 5 * 1000)
    }

    _log(message, ...args) {
        if (this.debug) {
            console.debug("[WEBSOCKET] " + message, ...args);
        }
    }

    _error(message, ...args) {
        if (this.debug) {
            console.error("[WEBSOCKET] " + message, ...args);
        }
    }

    getConnection() {
        if (this.connection) {
            return this.connection;
        } else {
            this._error('No connection found');
            return null;
        }
    }

    connect() {
        try {
            this._log('Connecting...');
            this.connection = new WebSocket('wss://localhost:8443', ["sg-protocol"]);
            // this.connection = new WebSocket('wss://localhost:8443');

            this.connection.onopen = (ws, event) => {
                this._log(`Connected.`);
                this.opened();
            };

            this.connection.onclose = event => {
                this._log('disconnected', event);
                if (event.code !== 1000) {
                    this._error('WebSocket closed unexpectedly, reconnecting...');
                    this._log('Retrying connection in 5 seconds...');
                    setTimeout(() => this.connect(), 5000);
                }
            };

            this.connection.onerror = error => {
                this._error('WebSocket error: ', error);
                this.connection.close();
            };
        } catch (error) {
            this._error('Error connecting to WebSocket: ', error);
            this._log('Retrying connection in 5 seconds...');
            setTimeout(() => this.connect(), 5000);
        }
    }

    opened() {
        this.connection.onerror = error => {
            this._log(`WebSocket error: `, error);
            this.connection.close();
        };

        this.connection.onmessage = event => {
            try {
                // if string convert to json
                let data = event.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        this._error('Error parsing JSON', e);
                    }
                }
                // check if data is an object and has a type property
                if (typeof data === 'object' && data !== null && data.type) {
                    // check if listeners has the type
                    if (this.listeners.has(data.type)) {
                        // call all listeners with the data
                        this.listeners.get(data.type).forEach(callback => callback(data));
                    } else {
                        this._error('No listener for type: ', data.type);
                    }
                } else {
                    this._error('Invalid data: ', data);
                }
            } catch (error) {
                this._error('Error processing message: ', error);
            }
        };
    }

    addListener(listener, callback) {
        if (this.listeners.has(listener)) {
            this._log('[?] Listener already exists. Ignoring new add: ', listener);
            // TODO: Choose if replace, ignore or add new one
        } else {
            this._log('[+] Creating new listener: ', listener);
            this.listeners.set(listener, [callback]);
        }
    }

    addCallback(listener, callback) {
        if (this.listeners.has(listener)) {
            this._log('[+] adding new callback to listener: ', listener);
            this.listeners.get(listener).push(callback);
        } else {
            this._error('Listener not found: ', listener);
        }
    }

    removeListener(listener) {
        if (this.listeners.has(listener)) {
            this._log('[-] Removing listener: ', listener);
            this.listeners.delete(listener);
        } else {
            this._error('Listener not found: ', listener);
        }
    }

    send(data) {
        try {
            if (this.connection.readyState !== WebSocket.OPEN) {
                this._error('WebSocket is not open. Current state: ', this.connection.readyState);
                return;
            }
            this.connection.send(JSON.stringify(data));
        } catch (error) {
            this._error('Error sending data: ', error);
        }
    }

    close() {
        this.connection.close();
    }

    getSocket() {
        return this.connection;
    }
}

const ws = new WSWrapper();
ws.connect();

export default ws;