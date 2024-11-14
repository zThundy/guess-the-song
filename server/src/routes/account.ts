import router, { Request, Response } from "express";

const accountRouter = router();

accountRouter.get('/', (req: Request, res: Response) => {
    console.log('account');
    res.json({ message: 'It works!' });
});

accountRouter.post('/login', (req: Request, res: Response) => {
    const body = req.body;
    console.log("login", body);

    res.send('login');
});

type RegisterBody = {
    username: string;
    uniqueId: string;
    userImage: string;
    hasProperty: (key: string) => boolean;
};

accountRouter.post('/register', (req: Request, res: Response) => {
    // check if content of body is application/json
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid content-type' });
        return;
    }
    
    const body = req.body as RegisterBody;
    body.hasProperty = (key: string) => Object.keys(body).includes(key);

    // check if body contains username, uniqueId, userImage
    if (body.hasProperty('username') && body.hasProperty('uniqueId') && body.hasProperty('userImage')) {
        // validate userImage as image url
        const regExp = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
        if (body.userImage.length > 0 && !regExp.test(body.userImage)) {
            res.status(400).json({ message: 'Invalid user image' });
            return;
        }

        // if the uniqueId is empty, then generate a random one
        if (body.uniqueId.length === 0) {
            body.uniqueId = Math.random().toString(36).substring(2, 15);
        }
        
        res.json(body);
    } else {
        res.status(400).json({ message: 'Invalid body' });
    }
});


export default accountRouter;