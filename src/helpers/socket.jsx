
class WSWrapper {
    constructor() {
        this.connection = null;
        this.listeners = new Map();
    }

    connect() {
        console.log('connecting...');
        this.connection = new WebSocket('wss://localhost:8443', ["sg-protocol"]);
        // this.connection = new WebSocket('wss://localhost:8443');

        this.connection.onopen = () => {
            console.log('connected');
            this.opened();
        };
    }

    opened() {
        this.connection.onerror = error => {
            console.log(`WebSocket error: `, error);
            this.connection.close();
        };

        this.connection.onmessage = event => {
            // if string convert to json
            let data = event.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing JSON', e);
                }
            }
            // check if data is an object and has a type property
            if (typeof data === 'object' && data !== null && data.type) {
                // check if listeners has the type
                if (this.listeners.has(data.type)) {
                    // call all listeners with the data
                    this.listeners.get(data.type).forEach(callback => callback(data));
                } else {
                    console.error('No listener for type: ', data.type);
                }
            } else {
                console.error('Invalid data: ', data);
            }
        };
    }

    addListener(listener, callback) {
        console.log('adding listener: ', listener);
        if (this.listeners.has(listener)) {
            console.log('listener already exists: ', listener);
            this.listeners.get(listener).push(callback);
        } else {
            console.log('creating new listener: ', listener);
            this.listeners.set(listener, [callback]);
        }
    }


    send(data) {
        this.connection.send(JSON.stringify(data));
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