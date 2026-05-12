import router, { Request, Response } from "express";
const WSWrapper = require('../wswrapper');

const musicRouter = router();

musicRouter.use((req: Request, res: Response, next) => {
  console.log(`Music route: ${req.method} ${req.path}`);
  next();
});

musicRouter.get("/songs", (req: Request, res: Response) => {
  WSWrapper.send({ route: "game", type: 'send-song', data: {  } });
});

export default musicRouter;