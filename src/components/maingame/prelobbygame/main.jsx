import classes from "./main.module.css";

import Users from "./users/main.jsx";
import StartButton from "./button/main.jsx";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

function PrelobbyGame({ status, id }) {
  const { t } = useTranslation();
  const constraintsRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const center = constraintsRef.current?.getBoundingClientRect();

  useEffect(() => {
    constraintsRef.current = document.getElementById('_content');
    if (center && (center.width !== 0 || center.height !== 0)) {
      // console.error("REREENDERING")
      setShouldRender(true);
    } else {
      setShouldRender(true);
      setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }
  }, [constraintsRef, center]);

  return (
    <motion.div
      className={classes.container}
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.1, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className={classes.content}>
        <div className={classes.content_outer}>
          <motion.div id="_content" className={classes.users} ref={constraintsRef}>
            <Typography variant='h6' className={classes.text}>{t("TOSS_USERS_PLACEHOLDER")} 🙃</Typography>
            {shouldRender ? <Users customRef={constraintsRef} /> : null}
          </motion.div>
        </div>

        <StartButton id={id} />
      </div>
    </motion.div>
  )
}

export default PrelobbyGame;