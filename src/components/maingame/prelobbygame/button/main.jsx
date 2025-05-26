import classes from "./main.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";

// import { useOnMountUnsafe } from "helpers/remountUnsafe";
// import socket from 'helpers/socket';
import api from "helpers/api";
import { useEventEmitter } from "helpers/eventEmitter";

function StartButton({ id, roomUniqueId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const eventEmitter = useEventEmitter();

  const handleButtonClick = () => {
    api.startGame(roomUniqueId)
      .then((data) => {
        navigate("/game/" + id, { state: { started: true } });
      })
      .catch((error) => {
        console.error(error);
        // Handle error, e.g., show a notification
        eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"));
      });

  }

  const changeHover = (e, hover) => {
    setHover(hover);
  }

  return (
    <div className={classes.container}>
      <div
        variant='contained'
        color='primary'
        className={classes.button}
        onClick={handleButtonClick}
        onMouseEnter={(e) => {
          changeHover(e, true);
        }}
        onMouseLeave={(e) => {
          changeHover(e, false);
        }}
      >
        <AnimatePresence>
          {hover ? <motion.div
            key={"bg1"}
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: "0%", opacity: 0 }}
            transition={{ delay: 0, duration: .3, ease: "easeInOut" }}
            className={`${classes.bg} ${classes.bg1}`}></motion.div> : null}
        </AnimatePresence>
        <span className={classes.text}>{t("START_GAME")}</span>
      </div>
    </div>
  )
}

export default StartButton;