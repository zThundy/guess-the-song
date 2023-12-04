import "./main.css";

import { useState } from "react";

import LobbyGame from "./lobbygame/main.jsx";
import JoinGame from "./joingame/main.jsx";
import Header from "../maingameheader/main.jsx";

import { motion } from 'framer-motion'

function MainGame() {
  const [status] = useState("lobby"); // lobby, game, create

  return (
    <motion.div
      className="container"
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header status={status} />
      { status === "game" ? <LobbyGame started={status} /> : <JoinGame started={status} /> }
    </motion.div>
  )
}

export default MainGame;