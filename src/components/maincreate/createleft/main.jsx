import "./main.css";

import { MusicNote, Videocam, Movie, SportsEsports, HourglassBottom } from "@mui/icons-material";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@mui/material";

const _categories = [
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
]

const _generes = [
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
]

function DifficutlyButtons({ choices, setChoices }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  if (!choices.genere) return null;

  const handleMouseClick = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    setSelectedDifficulty(id);
    setChoices({ category: choices.category, genere: choices.genere, difficulty: id });
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 1.3, 1], rotate: [0, 8, -8, 10, -10, 0] }}
      transition={{ duration: 0.4 }}
      className="createSelectDifficulty"
    >
      <Button disableRipple variant="contained" data-id="1" className={"easy " + (selectedDifficulty === 1 ? "selected" : "")} onMouseDown={handleMouseClick}>Easy</Button>
      <Button disableRipple variant="contained" data-id="2" className={"normal " + (selectedDifficulty === 2 ? "selected" : "")} onMouseDown={handleMouseClick}>Normal</Button>
      <Button disableRipple variant="contained" data-id="3" className={"hard " + (selectedDifficulty === 3 ? "selected" : "")} onMouseDown={handleMouseClick}>Hard</Button>
    </motion.div>
  )
}

function Generes({ choices, setChoices, enableTimeout, scrollTimeout }) {
  const [selectedGenere, setSelectedGenere] = useState(0);
  const [generes, setGeneres] = useState(_generes);
  const genereRef = useRef(null);
  if (!choices.category) return null;

  const handleScrollGenere = (e) => {
    if (scrollTimeout) return;
    enableTimeout();
    if (e.deltaY > 0) {
      setSelectedGenere(prevIndex => Math.min(prevIndex + 1, genereRef.current.children.length - 1));
    } else {
      setSelectedGenere(prevIndex => Math.max(prevIndex - 1, 0));
    }
    genereRef.current.children[selectedGenere].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  const handleMouseClick = (e) => {
    // get id from dataset
    const id = Number(e.currentTarget.dataset.id);
    setSelectedGenere(id);
    setChoices({ category: choices.category, genere: generes[id], difficulty: choices.difficulty || null });
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 1.1, 1], rotate: [0, 5, -5, 8, -8, 0] }}
      transition={{ duration: 0.4 }}
      className="createSelectContainer"
      onWheel={handleScrollGenere}
    >
      <div className="createSelectGenere" ref={genereRef}>
        {
          generes.map((genere, index) => {
            return (
              <div className="genere" key={index} onMouseDown={handleMouseClick} data-id={index}>
                {index === selectedGenere && <div className="createSelectArrowDown"></div>}

                <div className="genereIcon">
                  {genere.icon}
                </div>
                <div className="createGenereName">
                  {genere.name}
                </div>
              </div>
            )
          })
        }
      </div>
    </motion.div>
  )
}

function CreateLobbyLeft() {
  const [categories, setCategories] = useState(_categories);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState(false);
  const [choices, setChoices] = useState({ category: null, genere: null, difficulty: null });

  const categoryRef = useRef(null);

  const enableTimeout = () => {
    setScrollTimeout(true);
    setTimeout(() => { setScrollTimeout(false); }, 300);
  }

  const handleScrollCategory = (e) => {
    if (scrollTimeout) return;
    enableTimeout();
    if (e.deltaY > 0) {
      setSelectedCategory(prevIndex => Math.min(prevIndex + 1, categoryRef.current.children.length - 1));
    } else {
      setSelectedCategory(prevIndex => Math.max(prevIndex - 1, 0));
    }
    categoryRef.current.children[selectedCategory].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  const handleMouseClick = (e) => {
    // get id from dataset
    const id = Number(e.currentTarget.dataset.id);
    setSelectedCategory(id);
    setChoices({ category: categories[id], genere: choices.genere || null, difficulty: choices.difficulty || null });
  }

  return (
    <div className="createLeftContainer">
      <div className="createSelectContainer" onWheel={handleScrollCategory}>
        <div className="createSelectCategory" ref={categoryRef}>
          {
            categories.map((category, index) => {
              return (
                <div className="category" key={index} onMouseDown={handleMouseClick} data-id={index}>
                  {index === selectedCategory && <div className="createSelectArrowDown"></div>}

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
      </div>
      <Generes
        enableTimeout={enableTimeout}
        scrollTimeout={scrollTimeout}
        setChoices={setChoices}
        choices={choices}
      />
      <DifficutlyButtons
        setChoices={setChoices}
        choices={choices}
      />
    </div>
  )
}

export default CreateLobbyLeft;