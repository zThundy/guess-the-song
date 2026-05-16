import router, { Request, Response } from "express";
import { buildApiResponseForCategories, buildApiResponseForGenres } from "../manifestManager";

const createRouter = router();

createRouter.use((req: Request, res: Response, next) => {
  console.log(`Account route: ${req.method} ${req.path}`);
  next();
});

createRouter.get("/categories", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_CATEGORIES", message: "Categories not found" })
  res.json(buildApiResponseForCategories()).end();
})

createRouter.get("/genres", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_GENRES", message: "Genres not found" })
  res.json(buildApiResponseForGenres()).end();
})

export default createRouter;