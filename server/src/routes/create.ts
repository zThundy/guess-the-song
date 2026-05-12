import router, { Request, Response } from "express";

const createRouter = router();
const musicManifest = require("../../music/manifest.json");

createRouter.use((req: Request, res: Response, next) => {
  console.log(`Account route: ${req.method} ${req.path}`);
  next();
});

const comingSoon = {
  name: "Coming soon...",
  icon: "HourglassBottom",
  disabled: true
}

interface Genre {
  name: string;
  icon?: string;
  allowedCategory: string[];
}

// {
//   name: "Rock",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "New",
//   icon: "AddCircle",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Sanremo",
//   icon: "LibraryMusic",
//   allowedCategory: ["music"]
// },
// {
//   name: "Pop",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Jazz",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Classical",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Hip Hop",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Rap",
//   icon: "MusicNote",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Country",
//   icon: "Movie",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Metal",
//   allowedCategory: ["music", "movies"]
// },
// {
//   name: "Japanese",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },
// {
//   name: "Korean",
//   icon: "SportsEsports",
//   allowedCategory: ["music", "movies", "tvshows", "videogames"]
// },

createRouter.get("/genres", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_GENRES", message: "Genres not found" })

  // make a distinct list of genres from the manifest and use the category from the manifest
  let genres: Genre[] = [];
  musicManifest.forEach((song: { genres: string[]; category: string }) => {
    song.genres.forEach((genre) => {
      if (!genres.find((g) => g.name === genre)) {
        genres.push({
          name: genre,
          icon: "MusicNote",
          allowedCategory: [song.category]
        });
      };
    });
  });

  res.json(genres).end();
})

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

createRouter.get("/categories", (req: Request, res: Response) => {
  // res.status(404).json({ key: "CREATE_ERROR_LOAD_CATEGORIES", message: "Categories not found" })

  // make a distinct list of categories from the manifest
  let categories: { id?: string; name: string; icon?: string }[] = [];
  musicManifest.forEach((song: { category: string }) => {
    const categoryName = capitalizeFirstLetter(song.category);
    if (!categories.find((c) => c.name === categoryName)) {
      categories.push({
        id: categoryName.toLowerCase(),
        name: categoryName,
        icon: song.category === "music" ? "MusicNote" : song.category === "movies" ? "Movie" : song.category === "tvshows" ? "Tv" : song.category === "videogames" ? "SportsEsports" : undefined
      });
    }
  });

  categories.push(comingSoon);
  res.json(categories).end();
})

export default createRouter;