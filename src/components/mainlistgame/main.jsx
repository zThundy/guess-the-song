import classes from "./main.module.css";

import { useEffect, useState } from "react";

import JoinGame from "./joingame/main.jsx";
import Header from "../maingameheader/main.jsx";

import { motion } from 'framer-motion';

const api = require("@helpers/api");

function MainGame() {

  useEffect(() => {
  }, []);

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