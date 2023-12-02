import "./main.css";

import Header from "../maingameheader/main.jsx";

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
    </motion.div>
  )
}

export default MainGame;