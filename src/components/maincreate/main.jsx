import classes from "./main.module.css";

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "../maingameheader/main.jsx";
import CreateLobbyLeft from "./createleft/main.jsx";
import CreateLobbyRight from "./createright/main.jsx";

import api from "helpers/api";
import { useEventEmitter } from "helpers/eventEmitter";

function MainCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [globalChoices, setGlobalChoices] = useState({});
  const eventEmitter = useEventEmitter();

  const computeSetChoices = (data) => {
    globalChoices[data.type] = data.value;
    setGlobalChoices(globalChoices);
  }

  const createRoom = () => {
    if (globalChoices.category === undefined) {
      eventEmitter.emit("notify", "error", t("CREATE_GENERIC_ERROR_CATEGORY"));
      return;
    }
    if (globalChoices.genre === undefined) {
      eventEmitter.emit("notify", "error", t("CREATE_GENERIC_ERROR_GENRE"));
      return;
    }
    api.createRoom(globalChoices)
      .then((data) => {
        api.validateInviteCode(data.inviteCode)
          .then((data) => {
            navigate("/game/" + data.inviteCode, { state: { id: data.inviteCode } });
          })
          .catch((error) => {
            console.log(error);
            eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"));
          });
      })
      .catch((error) => {
        console.log(error);
        eventEmitter.emit("notify", "error", t(error.key));
      });
  }

  return (
    <motion.div
      className={classes.container}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
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