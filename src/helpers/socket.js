
class WSWrapper {
    constructor() {
        this.connection = null;
    }

    connect() {
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
            console.log(event.data);
        };
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