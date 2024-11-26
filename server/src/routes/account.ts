import router, { Request, Response } from "express";
import { RegisterBody } from "../../types/account_types";
import User from "../user";

const accountRouter = router();

const { addUser, getUser, hasUser } = require('../states.ts');
const { hasProperty } = require('../utils.ts');

accountRouter.use((req: Request, res: Response, next) => {
    console.log(`Account route: ${req.method} ${req.path}`);
    next();
});

accountRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Account works!' });
});

accountRouter.post("/image", async (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        console.error('Invalid content-type:', req.headers['content-type']);
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RegisterBody;

    if (!hasProperty(body, 'uniqueId')) {
        console.error('Invalid body in /validateInviteCode - missing uniqueId');
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

        if (body.userImage.length > 0) {
            const regex = new RegExp(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g)
            if (!regex.test(body.userImage)) {
                console.error('Invalid image URL:', body.userImage);
                res.status(400).json({ message: 'Invalid image URL' });
                return;
            }
        }

        console.log(`Updating user ${user.getColumn('uniqueId')} with image ${body.userImage}`);
        if (user.getColumn('userImage') !== body.userImage)
            user.update({ column: 'userImage', value: body.userImage }).save();
        res.json(user.get());
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
    console.log(`Validating user ${body.username} (Length ${body.username?.length || "UNK"}) with uniqueId ${body.uniqueId} (Length ${body.uniqueId?.length || "UNK"})`);

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