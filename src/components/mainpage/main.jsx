import styles from "./main.css";

import wave from "./wave.svg";

import MainForm from "../mainform/main";
import MainGame from "../maingame/main";
import MainCreate from "../maincreate/main";
import MainErrorPage from "../mainerrorpage/main";

import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';

function MainPage() {
  const location = useLocation();

  return (
    <div className="main">
      <div className="color first"></div>
      <div className="color second"></div>
      <div className="color third"></div>
      <img
        src={wave}
        className="wave"
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
            title="Song Guesser - Game"
            Component={MainGame}
          />
          <Route
            path="/create"
            title="Song Guesser - Create"
            Component={MainCreate}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default MainPage;
