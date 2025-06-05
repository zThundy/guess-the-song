import { create } from "domain";
import router, { Request, Response } from "express";

const createRouter = router();

createRouter.use((req: Request, res: Response, next) => {
  console.log(`Account route: ${req.method} ${req.path}`);
  next();
});

createRouter.get("/genres", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_GENRES", message: "Genres not found" })

  res.json([
    {
      name: "Rock",
    },
    {
      name: "New",
      icon: "AddCircle"
    },
    {
      name: "Sanremo",
      icon: "LibraryMusic"
    },
    {
      name: "Pop",
    },
    {
      name: "Jazz",
    },
    {
      name: "Classical",
    },
    {
      name: "Hip Hop",
    },
    {
      name: "Rap",
      icon: "MusicNote"
    },
    {
      name: "Country",
      icon: "Movie"
    },
    {
      name: "Metal",
    },
    {
      name: "Japanese",
    },
    {
      name: "Korean",
      icon: "SportsEsports"
    },
  ])
})

createRouter.get("/categories", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_CATEGORIES", message: "Categories not found" })

  res.json([
    {
      name: "Music",
      icon: "MusicNote"
    },
    {
      name: "Movies",
      icon: "Videocam"
    },
    {
      name: "TV Shows",
      icon: "Movie"
    },
    {
      name: "Video Games",
      icon: "SportsEsports"
    },
    {
      name: "Coming soon...",
      icon: "HourglassBottom",
      disabled: true
    }
  ])
})

export default createRouter;