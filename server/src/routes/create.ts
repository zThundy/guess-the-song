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
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "New",
      icon: "AddCircle",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Sanremo",
      icon: "LibraryMusic",
      allowedCategory: ["music"]
    },
    {
      name: "Pop",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Jazz",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Classical",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Hip Hop",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Rap",
      icon: "MusicNote",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Country",
      icon: "Movie",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Metal",
      allowedCategory: ["music", "movies"]
    },
    {
      name: "Japanese",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
    {
      name: "Korean",
      icon: "SportsEsports",
      allowedCategory: ["music", "movies", "tvshows", "videogames"]
    },
  ])
})

createRouter.get("/categories", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_CATEGORIES", message: "Categories not found" })

  res.json([
    {
      id: "music",
      name: "Music",
      icon: "MusicNote"
    },
    {
      id: "movies",
      name: "Movies",
      icon: "Videocam"
    },
    {
      id: "tvshows",
      name: "TV Shows",
      icon: "Movie"
    },
    {
      id: "videogames",
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