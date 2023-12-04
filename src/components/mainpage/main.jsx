import "./main.css";
import wave from "./wave.svg";

import MainForm from "../mainform/main";
import MainGame from "../maingame/main";
import MainCreate from "../maincreate/main";

import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';

function MainPage() {
  const location = useLocation();

  return (
    <div className="main">
      <div className="color first"></div>
      <div className="color second"></div>
      <div className="color third"></div>
      <img src={wave} className="wave" alt="wave" />
      <AnimatePresence mode='wait'>
        <Routes location={location} key={location.pathname}>
          <Route
            exact
            path="/"
            title="Song Guesser"
            element={<MainForm />}
          />
          <Route
            path="/game"
            title="Song Guesser - Game"
            element={<MainGame />}
          />
          <Route
            path="/create"
            title="Song Guesser - Create"
            element={<MainCreate />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default MainPage;
