import classes from "./main.module.css";

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "../maingameheader/main.jsx";
import CreateLobbyLeft from "./createleft/main.jsx";
import CreateLobbyRight from "./createright/main.jsx";

import api from "helpers/api";

function MainCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [alertTitle, setAlertTitle] = useState("");
  const [globalChoices, setGlobalChoices] = useState({});
  useEffect(() => { if (alertTitle) setTimeout(() => setAlertTitle(""), 11000) }, [alertTitle]);

  const computeSetChoices = (data) => {
    globalChoices[data.type] = data.value;
    setGlobalChoices(globalChoices);
  }

  const createRoom = () => {
    if (globalChoices.category === undefined) {
      setAlertTitle(t("CREATE_GENERIC_ERROR_CATEGORY"));
      return;
    }
    if (globalChoices.genre === undefined) {
      setAlertTitle(t("CREATE_GENERIC_ERROR_GENRE"));
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
            // setSubmitted(t(error.key));
          });
        // navigate("/game/" + data.inviteCode, { state: { id: data.inviteCode } });
      })
      .catch((error) => {
        console.log(error);
        setAlertTitle(error.message);
      });
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