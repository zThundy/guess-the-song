import "./main.css";

import Header from "../maingameheader/main.jsx";
import Sidebar from "../gamebar/main.jsx";
import Game from "../game/main.jsx";

import { motion } from 'framer-motion'

function MainGame() {

  return (
    <motion.div
      className="container"
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header />
      <div className="gameContainer">
        <Sidebar />
        <Game />
      </div>
    </motion.div>
  )
}

export default MainGame;