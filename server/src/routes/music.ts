import router, { Request, Response } from "express";
import path from "path";
import fs from "fs";
const WSWrapper = require('../wswrapper');
const musicManifestPath: string = path.join(__dirname, "..", "..", "music", "manifest.json");
const musicManifest = require(musicManifestPath);
console.log("MUSIC-LOG", `Loaded music manifest with ${musicManifest.length} songs.`);

const musicRouter = router();

musicRouter.use((req: Request, res: Response, next) => {
  console.log("MUSIC-LOG", `Music route: ${req.method} ${req.path}`);
  next();
});

musicRouter.get("/:id/picture", (req: Request, res: Response) => {
  const songId = req.params.id as string;
  const song = musicManifest.find((s: any) => s.id === songId);
  if (!song) {
    return res.status(404).json({ message: "Song not found" });
  }
  // search for any file that is a picture format in the song folder, if there are multiple, use the first one
  const pictureSupportedFormats = ["jpg", "jpeg", "png", "gif"];
  const songFolder = path.join(__dirname, "..", "..", "music", songId, `${songId}.`);
  let picturePath: string | null = null;

  for (const format of pictureSupportedFormats) {
    const potentialPath = `${songFolder}${format}`;
    if (fs.existsSync(potentialPath)) {
      picturePath = potentialPath;
      break;
    }
  }

  if (!picturePath) {
    return res.status(404).json({ message: "Picture not found for this song" });
  }

  res.sendFile(picturePath);
});

export default musicRouter;