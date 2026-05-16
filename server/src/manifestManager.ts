

import path from "path";
import fs from "fs";
const musicManifestPath: string = path.join(__dirname, "..", "music", "manifest.json");

let musicManifest: any[] = [];

interface Genre {
  name: string;
  icon?: string;
  allowedCategory: string[];
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  disabled?: boolean;
}

const icons: { [key: string]: string } = {
  ["videogames"]: "SportsEsports",
  ["movies"]: "Movie",
  ["tvshows"]: "Tv",
  ["music"]: "MusicNote"
}

const comingSoon = {
  id: "comingsoon",
  name: "Coming soon...",
  icon: "HourglassBottom",
  disabled: true
}

export const updateManifest = () => {
  try {
    const manifestData = fs.readFileSync(musicManifestPath, "utf-8");
    musicManifest = JSON.parse(manifestData);
    console.log("MANIFEST-LOG", `Music manifest updated. Now has ${musicManifest.length} songs.`);
  } catch (err: any) {
    console.error("MANIFEST-LOG", `Error reading music manifest: ${err.message}`);
  }
};

export const getMusicManifest = () => {
  return musicManifest;
};

export const getGenresAndCategories = () => {
  updateManifest();
  let result: { [category: string]: { [genre: string]: any[] } } = {};
  let categoriesNumber: number = 0;
  let genresNumber: number = 0;
  for (const song of musicManifest) {
    if (!result[song.category]) {
      result[song.category] = {};
      categoriesNumber++;
    }
    for (const genre of song.genres) {
      if (!result[song.category][genre]) {
        result[song.category][genre] = [];
        genresNumber++;
      }
      result[song.category][genre].push(song);
    }
  }
  console.log("MANIFEST-LOG", `Processed music manifest. Found ${categoriesNumber} categories and ${genresNumber} genres.`);
  return result;
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const distinctOnGenres = () => {
  let total = getGenresAndCategories();
  let result = new Set<string>();
  for (const category in total) {
    for (const genre in total[category]) {
      result.add(genre);
    }
  }
  return Array.from(result);
};

export const distinctOnCategories = () => {
  let total = getGenresAndCategories();
  let result = new Set<string>();
  for (const category in total) {
    result.add(category);
  }
  return Array.from(result);
};

const getAllowedCategoriesForGenre = (total: any, genre: string): string[] => {
  let result: Set<string> = new Set<string>();
  for (const category in total) {
    if (total[category][genre]) {
      result.add(category);
    }
  }
  return Array.from(result);
};

export const buildApiResponseForCategories: () => Category[] = () => {
  let categories = distinctOnCategories();
  console.log("MANIFEST-LOG", `Building API response for categories. Found categories: ${categories.join(", ")}`);
  let result: Category[] = [];
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    result[i] = {
      id: category.toLowerCase(),
      name: capitalizeFirstLetter(category),
      icon: icons[category.toLowerCase()] || "MusicNote",
      disabled: false
    }
  }
  result.push(comingSoon);
  console.log("MANIFEST-LOG", `Returning API response for categories: ${JSON.stringify(result)}`);
  return result;
};

export const buildApiResponseForGenres: () => Genre[] = () => {
  let genres = distinctOnGenres();
  let total = getGenresAndCategories();
  console.log("MANIFEST-LOG", `Building API response for genres. Found genres: ${genres.join(", ")}`);
  let result: Genre[] = [];
  for (let i = 0; i < genres.length; i++) {
    const genre = genres[i];
    result[i] = {
      name: capitalizeFirstLetter(genre),
      icon: icons[genre.toLowerCase()] || "MusicNote",
      allowedCategory: getAllowedCategoriesForGenre(total, genre)
    }
  }
  console.log("MANIFEST-LOG", `Returning API response for genres: ${JSON.stringify(result)}`);
  return result;
};