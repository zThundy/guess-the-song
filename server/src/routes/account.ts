import router, { Request, Response } from "express";
import { RegisterBody } from "../../types/account_types";
import User from "../user";
// import { UserInstance } from "../../types/user_types";

const accountRouter = router();

const { addUser, getUser, hasUser } = require('../states.ts');
const hasProperty = (data: object, key: string) => Object.keys(data).includes(key);

accountRouter.use((req: Request, res: Response, next) => {
    console.log(`Account route: ${req.method} ${req.path}`);
    next();
});

accountRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Account works!' });
});

accountRouter.post("/image", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RegisterBody;

    if (!hasProperty(body, 'uniqueId')) {
        res.status(400).json({ message: 'Invalid body' });
        return;
    }

    if (hasProperty(body, 'userImage')) {
        let user = getUser(body.uniqueId);
        if (!user) {
            user = new User(body.uniqueId, body.username, body.userImage);
            await user.validateUser();
            addUser(user);
        }
        user.update({ column: 'userImage', value: body.userImage });
        res.json(user.save().get());
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});

accountRouter.post("/username", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RegisterBody;

    if (!hasProperty(body, 'uniqueId')) {
        res.status(400).json({ message: 'Invalid body' });
        return;
    }

    if (hasProperty(body, 'username')) {
        let user = getUser(body.uniqueId);
        if (!user) {
            user = new User(body.uniqueId, body.username, body.userImage);
            await user.validateUser();
            addUser(user);
        }
        user.update({ column: 'username', value: body.username });
        res.json(user.save().get());
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});

accountRouter.post('/validate', async (req: Request, res: Response) => {
    // check if content of body is application/json
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RegisterBody;

    // check if body contains username, uniqueId, userImage
    if (hasProperty(body, 'uniqueId')) {
        let user: User;
        if (hasUser(body.uniqueId)) {
            user = getUser(body.uniqueId);
        } else {
            user = new User(body.uniqueId, body.username, body.userImage);
            await user.validateUser();
            addUser(user);
        }

        res.json(user.get());
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});


export default accountRouter;