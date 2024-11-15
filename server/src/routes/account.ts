import router, { Request, Response } from "express";
import { RegisterBody } from "../../types/account_types";

const db = require('../sql.ts');
const accountRouter = router();

accountRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Account works!' });
});

accountRouter.post("/image", (req: Request, res: Response) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }

    const body = req.body as RegisterBody;
    body.hasProperty = (key: string) => Object.keys(body).includes(key);

    if (body.hasProperty('userImage')) {
        const regExp = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
        if (body.userImage.length > 0 && !regExp.test(body.userImage)) {
            res.status(400).json({ message: 'Invalid user image' });
            return;
        }

        db.updateImage(body);
        res.json(body);
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
    body.hasProperty = (key: string) => Object.keys(body).includes(key);

    // check if body contains username, uniqueId, userImage
    if (body.hasProperty('username') && body.hasProperty('uniqueId')) {
        // if userImage is empty, then set a default image
        if (!body.hasProperty('userImage')) {
            body.userImage = ""
        } else {
            const regExp = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
            if (body.userImage.length > 0 && !regExp.test(body.userImage)) {
                body.userImage = ""
            }
        }

        // if username is empty, then generate a random one
        if (body.username.length === 0) {
            body.username = 'User-' + Math.random().toString(36).substring(2, 8);
        }

        res.json(await db.validateUser(body));
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});


export default accountRouter;