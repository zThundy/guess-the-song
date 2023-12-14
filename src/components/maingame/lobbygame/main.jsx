import "./main.css";

import Sidebar from "./gamebar/main.jsx";
import Game from "./game/main.jsx";

import { motion } from 'framer-motion';

function LobbyGame({ status, id }) {
  return (
    <motion.div
      className="gameContainer"
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.1, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Sidebar />
      <Game />
    </motion.div>
  )
}

export default LobbyGame