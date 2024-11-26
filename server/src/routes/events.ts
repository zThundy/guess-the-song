import router, { Request, Response } from "express";
import User from "../user";
import eventHandler from "../eventsHandler";

const eventsRouter = router();

const { addUser, getUser, hasUser } = require('../states.ts');

eventsRouter.use((req: Request, res: Response, next: Function) => {
    console.log("Got request on /events. URL: " + req.url);
    next();
});

eventsRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Events works!' });
});

eventsRouter.post("/subscribe", async (req: Request, res: Response) => {
    const body = req.body;
    if (!body) {
        console.error("No body provided.");
        res.status(400).json({ error: "No body provided." });
        return;
    }

    if (!body.event) {
        console.error("No event provided.");
        res.status(400).json({ error: "No event provided." });
        return;
    }

    if (!body.uniqueId || body.uniqueId.length === 0) {
        console.error("No uniqueId provided.");
        res.status(400).json({ error: "No uniqueId provided." });
        return;
    }

    try {
        let user = getUser(body.uniqueId);
        if (!user) {
            user = new User(body.uniqueId, body.username, body.userImage);
            await user.validateUser();
            addUser(user);
        }
        body.uniqueId = user.getColumn('uniqueId');

        // register event subscription with keep-alive
        eventHandler.addEvent(body.event, req, res);
    } catch (e: any) {
        console.error(e.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

eventsRouter.post("/unsubscribe", async (req: Request, res: Response) => {
    const body = req.body;
    if (!body) {
        console.error("No body provided.");
        res.status(400).json({ error: "No body provided." });
        return;
    }

    if (!body.event) {
        console.error("No event provided.");
        res.status(400).json({ error: "No event provided." });
        return;
    }

    if (!body.uniqueId || body.uniqueId.length === 0) {
        console.error("No uniqueId provided.");
        res.status(400).json({ error: "No uniqueId provided." });
        return;
    }

    try {
        let user = getUser(body.uniqueId);
        if (!user) {
            user = new User(body.uniqueId, body.username, body.userImage);
            await user.validateUser();
            addUser(user);
        }
        req.body.uniqueId = user.getColumn('uniqueId');

        // remove event subscription
        eventHandler.unsubscribe(body.event, body.uniqueId, req, res);
    } catch (e: any) {
        console.error(e.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default eventsRouter;