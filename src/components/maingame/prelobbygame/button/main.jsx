import classes from "./main.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";

function StartButton({ id }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  const handleButtonClick = () => {
    navigate("/game/" + id, { state: { started: true } });
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
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ width: "0%" }}
            transition={{ delay: 0, duration: .3, ease: "easeInOut" }}
            className={`${classes.bg} ${classes.bg1}`}></motion.div> : null}
          {hover ? <motion.div
            key={"bg2"}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ width: "0%" }}
            transition={{ delay: 0.1, duration: .3, ease: "easeInOut" }}
            className={`${classes.bg} ${classes.bg2}`}></motion.div> : null}
          {hover ? <motion.div
            key={"bg3"}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ width: "0%" }}
            transition={{ delay: 0.3, duration: .3, ease: "easeInOut" }}
            className={`${classes.bg} ${classes.bg3}`}></motion.div> : null}
        </AnimatePresence>
        <span className={classes.text}>{t("START_GAME")}</span>
      </div>
    </div>
  )
}

export default StartButton;