import "./main.css";

import { motion } from 'framer-motion'

import Header from "../maingameheader/main.jsx";
import CreateLobbyLeft from "./createleft/main.jsx";
import CreateLobbyRight from "./createright/main.jsx";

function MainCreate() {
  return (
    <motion.div
      className="container"
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header status="create" />
      <div className="createLobbyContainer">
        <CreateLobbyLeft />
        <CreateLobbyRight />
      </div>
    </motion.div>
  )
}

export default MainCreate;