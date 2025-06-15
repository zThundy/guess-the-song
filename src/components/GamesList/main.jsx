import classes from "./main.module.css";

// import { useEffect, useState } from "react";
import { motion } from 'framer-motion';

import JoinGame from "./joingame/main.jsx";
import Header from "../Header/main.jsx";

import { useOnMountUnsafe } from "helpers/remountUnsafe";
import socket from "helpers/socket";
// import api from "helpers/api";


function MainGame() {
  useOnMountUnsafe(() => {
    socket.removeListener("user-join");
    socket.removeListener("user-leave");
    socket.removeListener("game-start");
    socket.removeListener("game-ping");
  }, [])

  return (
    <motion.div
      className={classes.main}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header status={"list"} />
      <JoinGame started={"list"} />
    </motion.div>
  )
}

export default MainGame;