import "./main.css";
import wave from "./wave.svg";

import MainForm from "../mainform/main";
import MainGame from "../maingame/main";

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
          <Route path="/" exact element={<MainForm />} />
          <Route path="/game" element={<MainGame />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default MainPage;
