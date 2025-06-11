import classes from "./main.module.css";

import Users from "components/Lobby/prelobbygame/users/main";
import StartButton from "components/Lobby/prelobbygame/button/main";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import api from "helpers/api";
import { getCookie } from "helpers/cookies";
import { useOnMountUnsafe } from "helpers/remountUnsafe.jsx";
import socket from 'helpers/socket';
import { useNavigate } from "react-router-dom";

function PrelobbyGame({ room }) {
  const navigate = useNavigate()
  const { t } = useTranslation();
  const constraintsRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [users, setUsers] = useState([]);
  const center = constraintsRef.current?.getBoundingClientRect();

  useOnMountUnsafe(() => {
    api.getRoomUsers(room.inviteCode)
      .then((data) => {
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

        socket.addListener("user-join", (r) => {
          if (r.data.room.inviteCode === room.inviteCode) {
            setUsers((prev) => {
              let users = [...prev];
              // check if user already exists
              if (users.find((user) => user.uniqueId === r.data.user.uniqueId)) {
                console.log("user already exists", r.data.user.uniqueId);
                return users;
              }
              users.push({
                self: r.data.user.uniqueId === getCookie("uniqueId"),
                name: r.data.user.username,
                img: r.data.user.userImage || "",
                uniqueId: r.data.user.uniqueId,
              });
              console.log("added users", users);
              return users;
            })
          }
        });

        socket.addListener("user-leave", (r) => {
          if (r.data.room.inviteCode === room.inviteCode) {
            setUsers((prev) => {
              let users = [...prev];
              console.log("users", users, r.data.user.uniqueId);
              // check if user already exists
              if (!users.find((user) => user.uniqueId === r.data.user.uniqueId)) {
                console.log("user already exists", r.data.user.uniqueId);
                return users;
              }
              users = users.filter((user) => user.uniqueId !== r.data.user.uniqueId);
              return users;
            })
          }
        });

        socket.addListener("game-start", (r) => {
          console.log("game-start", r);
          navigate(`/game/${r.data.room.inviteCode}/play`)
        });

        socket.addListener("game-ping", (r) => {
          console.log("game-ping", r);

          socket.send({
            type: "game-pong",
            data: {
              roomUniqueId: room.roomUniqueId,
              uniqueId: getCookie("uniqueId") || "",
              id: room.inviteCode,
            }
          })
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      socket.removeListener("user-join");
      socket.removeListener("user-leave");
      socket.removeListener("game-start");
      socket.removeListener("game-ping");
    }
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
            {shouldRender && (room.users && room.users.length > 0) ? <Users customRef={constraintsRef} users={users} /> : null}
          </motion.div>
        </div>

        <StartButton room={room} />
      </div>
    </motion.div>
  )
}

export default PrelobbyGame;