import "./main.css";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { MusicNote, Videocam, Movie, SportsEsports, HourglassBottom } from "@mui/icons-material";
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
    icon: <HourglassBottom />,
    disabled: true
  }
]

const _generes = [
  {
    name: "Rock",
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
    icon: <MusicNote />
  },
  {
    name: "Country",
    icon: <Movie />
  },
  {
    name: "Metal",
  },
  {
    name: "Japanese",
  },
  {
    name: "Korean",
    icon: <SportsEsports />
  },
]

function DifficutlyButtons({ setGlobalChoices, choices, setChoices }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);

  const handleMouseClick = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    setSelectedDifficulty(id);
    setGlobalChoices({ type: "difficulty", value: id });
    setChoices({ category: choices.category, genere: choices.genere, difficulty: id });
  }

  useEffect(() => {
    setSelectedDifficulty((p) => {
      setGlobalChoices({ type: "difficulty", value: p });
      return p;
    });
  }, [choices.genere])

  return (
    choices.genere &&
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 1.3, 1], rotate: [0, 8, -8, 6, -6, 0] }}
      transition={{ duration: 0.3 }}
      className="createSelectDifficulty"
    >
      <Button disableRipple variant="contained" data-id="1" className={"easy " + (selectedDifficulty === 1 ? "selected" : "")} onMouseDown={handleMouseClick}>Easy</Button>
      <Button disableRipple variant="contained" data-id="2" className={"normal " + (selectedDifficulty === 2 ? "selected" : "")} onMouseDown={handleMouseClick}>Normal</Button>
      <Button disableRipple variant="contained" data-id="3" className={"hard " + (selectedDifficulty === 3 ? "selected" : "")} onMouseDown={handleMouseClick}>Hard</Button>
    </motion.div>
  )
}

function Generes({ setGlobalChoices, choices, setChoices, enableTimeout, scrollTimeout }) {
  const [selectedGenere, setSelectedGenere] = useState(0);
  const [generes, setGeneres] = useState(_generes);
  const genereRef = useRef(null);
  if (!choices.category) return null;

  const handleScrollGenere = (e) => {
    if (scrollTimeout) return;
    enableTimeout();
    if (e.deltaY > 0 && generes[selectedGenere + 1] && generes[selectedGenere + 1].disabled) return;
    if (e.deltaY > 0) {
      setSelectedGenere(prevIndex => Math.min(prevIndex + 1, genereRef.current.children.length - 1));
    } else {
      setSelectedGenere(prevIndex => Math.max(prevIndex - 1, 0));
    }
    genereRef.current.children[selectedGenere].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  const handleMouseClick = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    if (generes[id].disabled) return;
    setSelectedGenere(id);
    setGlobalChoices({ type: "genere", value: generes[id] });
    setChoices({ category: choices.category, genere: generes[id], difficulty: choices.difficulty });
    genereRef.current.children[id].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
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
                  {genere.icon ? genere.icon : <MusicNote />}
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

function CreateLobbyLeft({ setGlobalChoices }) {
  const [categories, setCategories] = useState(_categories);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState(false);
  const [choices, setChoices] = useState({ genere: null, category: null, difficulty: null });

  const categoryRef = useRef(null);

  const enableTimeout = () => {
    setScrollTimeout(true);
    setTimeout(() => { setScrollTimeout(false); }, 300);
  }

  const handleScrollCategory = (e) => {
    if (scrollTimeout) return;
    enableTimeout();
    if (e.deltaY > 0 && categories[selectedCategory + 1] && categories[selectedCategory + 1].disabled) return;
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
    if (categories[id].disabled) return;
    setSelectedCategory(id);
    setGlobalChoices({ type: "category", value: categories[id] });
    setChoices({ category: categories[id], genere: choices.genere, difficulty: choices.difficulty });
    categoryRef.current.children[id].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  return (
    <div className="createLeftContainer">
      <div className="createSelectContainer" onWheel={handleScrollCategory}>
        <div className="createSelectCategory" ref={categoryRef}>
          {
            categories.map((category, index) => {
              return (
                <div className="category" key={index} onMouseDown={handleMouseClick} data-id={index} data-disabled={category.disabled}>
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
        setGlobalChoices={setGlobalChoices}
        setChoices={setChoices}
        choices={choices}
      />
      <DifficutlyButtons
        setGlobalChoices={setGlobalChoices}
        setChoices={setChoices}
        choices={choices}
      />
    </div>
  )
}

export default CreateLobbyLeft;