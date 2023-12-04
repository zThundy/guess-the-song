import "./main.css";

import { MusicNote, Videocam, Movie, SportsEsports, HourglassBottom } from "@mui/icons-material";

import { useState } from "react";

function CreateLobbyLeft() {
  const [categories, setCategories] = useState([
    {
      name: "Music",
      icon: <MusicNote />
    },
    {
      name: "Movies",
      icon: <Videocam />
    },
    {
      name: "TV Shows",
      icon: <Movie />
    },
    {
      name: "Video Games",
      icon: <SportsEsports />
    },
    {
      name: "Coming soon...",
      icon: <HourglassBottom />
    }
  ]);

  const [generes, setGeneres] = useState([
    {
      name: "Rock",
      icon: <MusicNote />
    },
    {
      name: "Pop",
      icon: <MusicNote />
    },
    {
      name: "Jazz",
      icon: <MusicNote />
    },
    {
      name: "Classical",
      icon: <MusicNote />
    },
    {
      name: "Hip Hop",
      icon: <MusicNote />
    },
    {
      name: "Rap",
      icon: <MusicNote />
    },
    {
      name: "Country",
      icon: <MusicNote />
    },
    {
      name: "Metal",
      icon: <MusicNote />
    },
    {
      name: "Japanese",
      icon: <MusicNote />
    },
    {
      name: "Korean",
      icon: <MusicNote />
    },
  ]);
  
  return (
    <div className="createLeftContainer">
      <div className="createSelectCategory">
        {
          categories.map((category, index) => {
            return (
              <div className="category" key={index}>
                <div className="categoryIcon">
                  {category.icon}
                </div>
                <div className="createCategoryName">
                  {category.name}
                </div>
              </div>
            )
          })
        }
      </div>
      <div className="createSelectCategory">
        {
          generes.map((genere, index) => {
            return (
              <div className="category" key={index}>
                <div className="categoryIcon">
                  {genere.icon}
                </div>
                <div className="createCategoryName">
                  {genere.name}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CreateLobbyLeft;