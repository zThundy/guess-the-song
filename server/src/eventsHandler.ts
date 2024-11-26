import { Request, Response } from 'express';

class EventsHandler {
  events: any[string];

  constructor() {
    this.events = {};
    console.log("EventsHandler initialized");
  }

  getEvents() {
    // get a list of events names
    return Object.keys(this.events);
  }
  
  unsubscribe(event: string, userId: string, req: Request, res: Response) {
    if (!this.events[event]) {
      console.log(`No clients connected to event "${event}" or event does not exist`);
      res.status(400).json({ message: `No clients connected to event "${event}" or event does not exist` });
      return;
    }

    this.sendEvent(event, { status: "unsubscribed", userId });
    const client = this.events[event].find((client: any) => client.id === userId);
    if (client) {
      console.log(`Unsubscribing ${userId} from "${event}" event`);
      // close the connection
      client.res.end();

      this.events[event] = this.events[event].filter((client: any) => client.id !== userId);
      res.status(200).json({ message: "Unsubscribed from event" });
    } else {
      console.log(`User ${userId} not found in "${event}" event clients`);
      res.status(400).json({ message: "User not found in event" });
    }
  }

  addEvent(event: string, req: Request, res: Response) {
    const userId = req.body.uniqueId;
    if (!this.events[event]) {
      this.events[event] = [];
    } else {
      // check if user is already in the event
      const user = this.events[event].find((client: any) => client.id === userId);
      if (user) {
        console.log(`${userId} is already in the event, unsubscribing`);
        // this.unsubscribe(event, userId, req, res);
        res.status(400).json({ message: "You are already in the event" });
        return;
      }
    }

    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    const data = JSON.stringify({ status: "success", userId });
    res.write(`data: ${data}\n\n`);

    this.events[event].push({ id: userId, res });

    // maybe we don't need this???? WHO KNOWS
    req.on('close', () => {
      console.log(`${userId} Connection closed`);
      this.events[event] = this.events[event].filter((client: any) => client.id !== userId);
    });

    req.on('error', (e) => {
      console.log(`Subscriber: ${userId} - Event connection error: ${e.message}`);
      this.events[event] = this.events[event].filter((client: any) => client.id !== userId);
    });
  }

  /**
   * Used to send event data to a specific client or a list of clients
   * 
   * @param {String} event name of the event
   * @param {String || Array} userId is string, then send the event to the specified user, could also be an array of user ids
   * @param {*} data 
   */
  sendEventTo(event: string, userId: string, data: any) {
    if (!this.events[event]) {
      console.log(`No clients connected to event ${event} or event does not exist`);
      return;
    }

    // if userid is array of numbers then send to all users in the array
    if (Array.isArray(userId)) {
      userId.forEach(id => {
        const jsonData = JSON.stringify(data);
        console.log(`Sending: ${jsonData} to ${event} event clients`);
        const message = `data: ${jsonData}\n\n`;
        const client = this.events[event].find((client: any) => client.id === id);
        if (client) {
          client.res.write(message);
        }
      });
    } else {
      const jsonData = JSON.stringify(data);
      const message = `data: ${jsonData}\n\n`;
      console.log(`Sending: ${jsonData} to ${event} event clients`);
      const client = this.events[event].find((client: any) => client.id === userId);
      if (client) {
        client.res.write(message);
      } else {
        console.log(`User ${userId} not found in ${event} event clients`);
      }
    }
  }

  /**
   * Used to send event data to all subscribed clients
   * 
   * @param {String} event name of the event
   * @param {*} data 
   * @returns 
   */
  sendEvent(event: string, data: any) {
    if (!this.events[event]) {
      console.log(`No clients connected to event ${event} or event does not exist`);
      return;
    }

    const jsonData = JSON.stringify(data);
    const message = `data: ${jsonData}\n\n`;
    console.log(`Sending: ${jsonData} to ${event} event clients`);
    this.events[event].forEach((client: any) => client.res.write(message));
  }
}

export default new EventsHandler();