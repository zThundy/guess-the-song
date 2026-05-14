import router, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const WSWrapper = require('../wswrapper');
const musicManifestPath: string = path.join(__dirname, "..", "..", "music", "manifest.json");
const musicRouter = router();

const updateManifest = () => {
  try {
    const manifestData = fs.readFileSync(musicManifestPath, "utf-8");
    musicManifest = JSON.parse(manifestData);
    console.log("MUSIC-LOG", `Music manifest updated. Now has ${musicManifest.length} songs.`);
  } catch (err: any) {
    console.error("MUSIC-LOG", `Error reading music manifest: ${err.message}`);
  }
};

let musicManifest: any[] = [];
updateManifest();

musicRouter.use((req: Request, res: Response, next) => {
  console.log("MUSIC-LOG", `Music route: ${req.method} ${req.path}`);
  next();
});

musicRouter.get("/:id/picture", (req: Request, res: Response) => {
  updateManifest();
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