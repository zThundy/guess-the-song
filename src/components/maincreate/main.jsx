import classes from "./main.module.css";

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import { Alert } from "@mui/material";

import Header from "../maingameheader/main.jsx";
import CreateLobbyLeft from "./createleft/main.jsx";
import CreateLobbyRight from "./createright/main.jsx";

function MainCreate() {
  const [alertTitle, setAlertTitle] = useState("");
  const [globalChoices, setGlobalChoices] = useState({});
  useEffect(() => { if (alertTitle) setTimeout(() => setAlertTitle(""), 11000) }, [alertTitle]);

  const computeSetChoices = (data) => {
    globalChoices[data.type] = data.value;
    setGlobalChoices(globalChoices);
  }

  const createRoom = () => {
    if (globalChoices.category === undefined) {
      setAlertTitle("Please select a category");
      return;
    }
    if (globalChoices.genere === undefined) {
      setAlertTitle("Please select a genere");
      return;
    }
    console.log("creating room", globalChoices);
  }

  return (
    <motion.div
      className={classes.container}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      {
        alertTitle !== "" &&
        <Alert severity="error" className={classes.alert}>
          {alertTitle}
        </Alert>
      }
      <Header status="create" />
      <div className={classes.content}>
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