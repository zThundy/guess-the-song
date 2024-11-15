import styles from "./main.css";

import wave from "./wave.svg";

import MainForm from "../mainform/main";
import MainGame from "../maingame/main";
import MainCreate from "../maincreate/main";
import MainErrorPage from "../mainerrorpage/main";
import MainAccount from "../mainaccount/main";

import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import { useEffect } from "react";

const { setCookie, getCookie } = require("@helpers/cookies");
const api = require("@helpers/api");

function MainPage() {
  const location = useLocation();

  useEffect(() => {
    const username = getCookie("username");
    // make a random number xxxxx
    if (!username) {
      const randomUsername = `User${Math.floor(Math.random() * 10000)}`;
      setCookie("username", randomUsername, 365);
    }

    const uniqueId = getCookie("uniqueId");
    if (!uniqueId) {
      const randomUniqueId = Math.random().toString(36).substring(2, 15);
      setCookie("uniqueId", randomUniqueId, 365);
    }

    api.getBase();
  }, []);

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
