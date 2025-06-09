import style from "./main.module.css";
import genresStyle from "./genre.module.css";
import difficultyStyle from "./buttons.module.css";
import categoryStyle from "./category.module.css";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { Button, Skeleton, Icon } from "@mui/material";
import { MusicNote } from "@mui/icons-material";

import { useOnMountUnsafe } from "helpers/remountUnsafe";
import { useEventEmitter } from "helpers/eventEmitter";
import { convertSnakeToPaskalIcon } from "helpers/utils";
import api from "helpers/api"

function LoadingSkeleton() {
  let elements = new Array()

  for (var i = 0; i < 10; i++) {
    elements.push(
      <Skeleton
        key={i}
        width={"calc(10vw - 20px)"}
        height={"calc(10vw - 20px)"}
        style={{ margin: "1rem", borderRadius: ".5rem" }}
        variant="rectangular"
        animation="wave"
      />
    )
  }

  return (<>{elements}</>)
}

function DifficutlyButtons({ setGlobalChoices, choices, setChoices }) {
  const { t } = useTranslation();
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);

  const handleMouseClick = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    setSelectedDifficulty(id);
    setGlobalChoices({ type: "difficulty", value: id });
    setChoices({ category: choices.category, genre: choices.genre, difficulty: id });
  }

  useEffect(() => {
    setSelectedDifficulty((p) => {
      setGlobalChoices({ type: "difficulty", value: p });
      return p;
    });
  }, [choices.genre])

  return (
    choices.genre &&
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 1.3, 1], rotate: [0, 8, -8, 6, -6, 0] }}
      transition={{ duration: 0.3 }}
      className={difficultyStyle.createSelectDifficulty}
    >
      <Button disableRipple variant="contained" data-id="1" className={difficultyStyle.easy + " " + (selectedDifficulty === 1 ? difficultyStyle.selected : difficultyStyle.notSelected)} onMouseDown={handleMouseClick}>{t("DIFFICULTY_1")}</Button>
      <Button disableRipple variant="contained" data-id="2" className={difficultyStyle.normal + " " + (selectedDifficulty === 2 ? difficultyStyle.selected : difficultyStyle.notSelected)} onMouseDown={handleMouseClick}>{t("DIFFICULTY_2")}</Button>
      <Button disableRipple variant="contained" data-id="3" className={difficultyStyle.hard + " " + (selectedDifficulty === 3 ? difficultyStyle.selected : difficultyStyle.notSelected)} onMouseDown={handleMouseClick}>{t("DIFFICULTY_3")}</Button>
    </motion.div>
  )
}

function Genres({ setGlobalChoices, choices, setChoices, enableTimeout, scrollTimeout, selectedCategoryId }) {
  const { t } = useTranslation();
  const [selectedGenres, setSelectedGenres] = useState(0);
  const [genres, setGenres] = useState([]);
  const [cacheGenres, setCacheGenres] = useState([]);
  const genereRef = useRef(null);
  const eventEmitter = useEventEmitter();

  useEffect(() => {
    if (selectedCategoryId === "" || selectedCategoryId.length === 0) return;
    setSelectedGenres(0);
    if (cacheGenres.length === 0) {
      api.getGenres()
        .then((data) => {
          setCacheGenres(data);
          let generesToDisplay = []
          for (let i in data) {
            if (data[i].allowedCategory.includes(selectedCategoryId)) {
              generesToDisplay.push(data[i])
            }
          }
          setGenres(generesToDisplay);
          if (genereRef && genereRef.current) genereRef.current.children[0].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
        })
        .catch((error) => {
          console.error(error);
          eventEmitter.emit("notify", "error", t(error.key))
        })
    } else {
      const data = cacheGenres;
      let generesToDisplay = []
      for (let i in data) {
        if (data[i].allowedCategory.includes(selectedCategoryId)) {
          generesToDisplay.push(data[i])
        }
      }
      setGenres(generesToDisplay);
      if (genereRef && genereRef.current) genereRef.current.children[0].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
    }
  }, [selectedCategoryId])

  if (!choices.category) return null;

  const handleScrollGenres = (e) => {
    if (genereRef && genereRef.current) {
      if (scrollTimeout) return;
      enableTimeout();
      if (e.deltaY > 0 && genres[selectedGenres + 1] && genres[selectedGenres + 1].disabled) return;
      if (e.deltaY > 0) {
        setSelectedGenres(prevIndex => {
          const id = Math.min(prevIndex + 1, genereRef.current.children.length - 1);
          setGlobalChoices({ type: "genre", value: genres[id] });
          setChoices({ category: choices.category, genre: genres[id], difficulty: choices.difficulty });
          return id;
        });
      } else {
        setSelectedGenres(prevIndex => {
          const id = Math.max(prevIndex - 1, 0);
          setGlobalChoices({ type: "genre", value: genres[id] });
          setChoices({ category: choices.category, genre: genres[id], difficulty: choices.difficulty });
        });
      }
      genereRef.current.children[selectedGenres].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
    }
  }

  const handleMouseClick = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    if (genres[id].disabled) return;
    setSelectedGenres(id);
    setGlobalChoices({ type: "genre", value: genres[id] });
    setChoices({ category: choices.category, genre: genres[id], difficulty: choices.difficulty });
    if (genereRef && genereRef.current) genereRef.current.children[id].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 1.1, 1], rotate: [0, 5, -5, 8, -8, 0] }}
      transition={{ duration: 0.4 }}
      className={style.createSelectContainer}
      onWheel={handleScrollGenres}
    >
      <div className={genresStyle.createSelectGenres} ref={genereRef}>
        {
          genres.length > 0 ? genres.map((genre, index) => {
            return (
              <motion.div
                className={genresStyle.genre}
                key={index}
                onMouseDown={handleMouseClick}
                data-id={index}
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              >
                {index === selectedGenres && <motion.div animate={{ transform: ["scale(0.1)", "scale(1.5)", "scale(1)"], opacity: [0, 1, 1] }} transition={{ duration: 0.3 }} className={style.createSelectArrowDown}></motion.div>}

                <div className={genresStyle.genereIcon}>
                  {genre.icon ? (<Icon>{convertSnakeToPaskalIcon(genre.icon)}</Icon>) : <MusicNote />}
                </div>
                <div className={genresStyle.createGenresName}>
                  {genre.name}
                </div>
              </motion.div>
            )
          }) : <LoadingSkeleton />
        }
      </div>
    </motion.div>
  )
}

function CreateLobbyLeft({ setGlobalChoices }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [scrollTimeout, setScrollTimeout] = useState(false);
  const [choices, setChoices] = useState({ genre: null, category: null, difficulty: null });
  const eventEmitter = useEventEmitter();

  const categoryRef = useRef(null);

  useOnMountUnsafe(() => {
    api.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error(error)
        eventEmitter.emit("notify", "error", t(error.key))
      })
  }, [])

  const enableTimeout = () => {
    setScrollTimeout(true);
    setTimeout(() => { setScrollTimeout(false); }, 300);
  }

  const handleScrollCategory = (e) => {
    if (scrollTimeout) return;
    enableTimeout();
    if (e.deltaY > 0 && categories[selectedCategory + 1] && categories[selectedCategory + 1].disabled) return;
    if (e.deltaY > 0) {
      setSelectedCategory(prevIndex => {
        const id = Math.min(prevIndex + 1, categoryRef.current.children.length - 1);
        setGlobalChoices({ type: "category", value: categories[id] });
        setChoices({ category: categories[id], genre: choices.genre, difficulty: choices.difficulty });
        return id;
      });
      setSelectedCategoryId(categories[selectedCategory + 1].id)
    } else {
      if (selectedCategory === 0) return;
      setSelectedCategory(prevIndex => {
        const id = Math.max(prevIndex - 1, 0);
        setGlobalChoices({ type: "category", value: categories[id] });
        setChoices({ category: categories[id], genre: choices.genre, difficulty: choices.difficulty });
        return id;
      });
      setSelectedCategoryId(categories[selectedCategory - 1].id)
    }
    categoryRef.current.children[selectedCategory].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  const handleMouseClick = (e) => {
    // get id from dataset
    const id = Number(e.currentTarget.dataset.id);
    const categoryid = String(e.currentTarget.dataset.categoryid)
    if (categories[id].disabled) return;
    setSelectedCategoryId(categoryid);
    setSelectedCategory(id);
    setGlobalChoices({ type: "category", value: categories[id] });
    setChoices({ category: categories[id], genre: choices.genre, difficulty: choices.difficulty });
    categoryRef.current.children[id].scrollIntoView({ block: 'center', inline: "center", behavior: 'smooth' });
  }

  return (
    <div className={style.createLeftContainer}>
      <div className={style.createSelectContainer} onWheel={handleScrollCategory}>
        <div className={categoryStyle.createSelectCategory} ref={categoryRef}>
          {
            categories.length > 0 ? categories.map((category, index) => {
              return (
                <div className={categoryStyle.category} key={index} onMouseDown={handleMouseClick} data-id={index} data-disabled={category.disabled} data-categoryid={category.id}>
                  {index === selectedCategory && <motion.div animate={{ transform: ["scale(0.1)", "scale(1.5)", "scale(1)"], opacity: [0, 1, 1] }} transition={{ duration: 0.3 }} className={style.createSelectArrowDown}></motion.div>}

                  <div className={categoryStyle.categoryIcon}>
                    <Icon>{convertSnakeToPaskalIcon(category.icon)}</Icon>
                  </div>
                  <div className={categoryStyle.createCategoryName}>
                    {category.name}
                  </div>
                </div>
              )
            }) : <LoadingSkeleton />
          }
        </div>
      </div>
      <Genres
        enableTimeout={enableTimeout}
        scrollTimeout={scrollTimeout}
        setGlobalChoices={setGlobalChoices}
        setChoices={setChoices}
        choices={choices}
        selectedCategoryId={selectedCategoryId}
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