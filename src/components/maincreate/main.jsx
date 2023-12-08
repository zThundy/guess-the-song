import "./main.css";

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';

import Header from "../maingameheader/main.jsx";
import CreateLobbyLeft from "./createleft/main.jsx";
import CreateLobbyRight from "./createright/main.jsx";

function MainCreate() {
  const [globalChoices, setGlobalChoices] = useState({});

  const computeSetChoices = (data) => {
    console.log("changing choices", data)
    globalChoices[data.type] = data.value;
    setGlobalChoices(globalChoices);
  }

  const createRoom = () => {
    console.log("creating room", globalChoices);
  }

  return (
    <motion.div
      className="container"
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header status="create" />
      <div className="createLobbyContainer">
        <CreateLobbyLeft
          setGlobalChoices={computeSetChoices}
        />
        <CreateLobbyRight
          setGlobalChoices={computeSetChoices}
          create={createRoom}
        />
      </div>
    </motion.div>
  )
}

export default MainCreate;