import classes from "./main.module.css";

import Users from "./users/main.jsx";
import StartButton from "./button/main.jsx";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import api from "helpers/api";
import { getCookie } from "helpers/cookies";

function PrelobbyGame({ status, id }) {
  const { t } = useTranslation();
  const constraintsRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [users, setUsers] = useState([]);
  const center = constraintsRef.current?.getBoundingClientRect();

  useEffect(() => {
    api.getRoomUsers(id)
      .then((data) => {
        setUsers((prev) => {
          let users = [];
          for (let i = 0; i < data.length; i++) {
            users[i] = {
              self: data[i].uniqueId === getCookie("uniqueId"),
              name: data[i].username,
              img: data[i].userImage || "",
            };
          }
          return users;
        })
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [])

  useEffect(() => {
    constraintsRef.current = document.getElementById('_content');
    if (center && (center.width !== 0 || center.height !== 0)) {
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
            {shouldRender ? <Users customRef={constraintsRef} id={id} users={users} /> : null}
          </motion.div>
        </div>

        <StartButton id={id} />
      </div>
    </motion.div>
  )
}

export default PrelobbyGame;