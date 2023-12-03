import "./main.css";

import { useState } from "react";

import LobbyGame from "./lobbygame/main.jsx";
import JoinGame from "./joingame/main.jsx";
import Header from "../maingameheader/main.jsx";

import { motion } from 'framer-motion'

function MainGame() {
  const [started] = useState(true);

  return (
    <motion.div
      className="container"
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header started={started} />
      { started ? <LobbyGame started={started} /> : <JoinGame started={started} /> }
    </motion.div>
  )
}

export default MainGame;