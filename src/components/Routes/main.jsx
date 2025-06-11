import style from "./main.module.css";

import wave from "./wave.svg";

import MainForm from "components/LandingPage/main";
import MainGame from "components/Lobby/main";
import MainCreate from "components/CreateLobby/main";
import MainErrorPage from "components/Error/main";
import MainAccount from "components/Account/main";
import MainGameList from "components/GamesList/main";
import MainGameInProgress from "components/GameInProgress/main";
import Language from './languages';

import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';

function MainPage() {
  const location = useLocation();

  return (
    <div className={style.main}>
      <Language />

      <motion.div
        initial={{ height: "0rem", width: "0rem", scale: "0" }}
        transition={{ delay: 0, duration: 1.0, ease: [ 0.57, 0.4, 0.55, 1.17 ] }}
        animate={{
          height: "50rem",
          width: "50rem",
          scale: ["0", "2", "30"],
        }}
        className={`${style.color} ${style.first}`}
      ></motion.div>

      <motion.div
        initial={{ height: "0rem", width: "0rem", scale: "0" }}
        transition={{ delay: 0.5, duration: 1.1, ease: [ 0.57, 0.4, 0.55, 1.17 ] }}
        animate={{
          height: "50rem",
          width: "50rem",
          scale: ["0", "2", "30"],
        }}
        className={`${style.color} ${style.second}`}
      ></motion.div>

      <motion.div
        initial={{ height: "0rem", width: "0rem", scale: "0" }}
        transition={{ delay: 0.5, duration: 1.4, ease: [ 0.57, 0.4, 0.55, 1.17 ] }}
        animate={{
          height: "50rem",
          width: "50rem",
          scale: ["0", "2", "30"],
        }}
        className={`${style.color} ${style.third}`}
      ></motion.div>

      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1.4, ease: ["easeInOut"] }}
        src={wave}
        className={style.wave}
        alt="wave"
      />

      <AnimatePresence mode='wait'>
        <Routes location={location} key={location.pathname}>
          <Route
            path="*"
            title="Song Guesser - Error"
            Component={MainErrorPage}
          />
          <Route
            exact
            path="/"
            title="Song Guesser"
            Component={MainForm}
          />
          <Route
            path="/game"
            title="Song Guesser - Games"
            Component={MainGameList}
          />
          <Route
            path="/game/:id"
            title="Song Guesser - Lobby"
            Component={MainGame}
          />
          <Route
            path="/game/:id/play"
            title="Song Guesser - Game"
            Component={MainGameInProgress}
          />
          <Route
            path="/create"
            title="Song Guesser - Create"
            Component={MainCreate}
          />
          <Route
            path="/account"
            title="Song Guesser - Account"
            Component={MainAccount}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default MainPage;
