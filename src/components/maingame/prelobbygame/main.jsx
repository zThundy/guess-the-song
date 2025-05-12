import classes from "./main.module.css";

import Users from "./users/main.jsx";
import StartButton from "./button/main.jsx";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import api from "helpers/api";
import { getCookie } from "helpers/cookies";
import { useOnMountUnsafe } from "helpers/remountUnsafe.jsx";
import socket from 'helpers/socket';

function PrelobbyGame({ status, id }) {
  const { t } = useTranslation();
  const constraintsRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [users, setUsers] = useState([]);
  const center = constraintsRef.current?.getBoundingClientRect();

  useOnMountUnsafe(() => {
    console.log("PrelobbyGame", id);
    api.getRoomUsers(id)
      .then((data) => {
        console.log("getRoomUsers", data, id);
        setUsers((prev) => {
          let users = [];
          for (let i = 0; i < data.length; i++) {
            users[i] = {
              self: data[i].uniqueId === getCookie("uniqueId"),
              name: data[i].username,
              img: data[i].userImage || "",
              uniqueId: data[i].uniqueId,
            };
          }
          return users;
        })

        socket.addListener("user-join", (data) => {
          console.log("user-join", data, id);
          if (data.room.inviteCode === id) {
            setUsers((prev) => {
              let users = [...prev];
              // check if user already exists
              if (users.find((user) => user.uniqueId === data.user.uniqueId)) {
                console.log("user already exists", data.user.uniqueId);
                return users;
              }
              users.push({
                self: data.user.uniqueId === getCookie("uniqueId"),
                name: data.username,
                img: data.userImage || "",
                uniqueId: data.user.uniqueId,
              });
              console.log("added users", users);
              return users;
            })
          }
        });

        socket.addListener("user-leave", (data) => {
          console.log("user-leave", data, id);
          if (data.room.inviteCode === id) {
            setUsers((prev) => {
              let users = [...prev];
              console.log("users", users, data.user.uniqueId);
              // check if user already exists
              if (!users.find((user) => user.uniqueId === data.user.uniqueId)) {
                console.log("user already exists", data.user.uniqueId);
                return users;
              }
              users = users.filter((user) => user.uniqueId !== data.user.uniqueId);
              return users;
            })
          }
        });
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