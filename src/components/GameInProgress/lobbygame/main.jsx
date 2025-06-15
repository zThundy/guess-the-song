import classes from "./main.module.css";

import Sidebar from "./gamebar/main.jsx";
import Game from "./game/main.jsx";

import { useState } from "react";
import { motion } from 'framer-motion';
import { useLocation, useParams, useNavigate } from "react-router-dom";

import { useOnMountUnsafe } from "helpers/remountUnsafe";
import socket from "helpers/socket";
import api from "helpers/api";

function LobbyGame( ) {
  const [lobbyData, setLobbyData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useOnMountUnsafe(() => {
    setLobbyData((prev) => {
      const _lobbyData = location.state.data || null;
      console.log("lobby data", _lobbyData)
      if (prev.length === 0) {
        return _lobbyData;
      }

      api.validateInviteCode(_lobbyData.inviteCode)
        .then((data) => {
          socket.removeListener("game-start");
        })
        .catch((error) => {
          console.log(error);
          navigate("/game");
          eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"));
        });
      // TODO: update lobby data if update happens
      return prev;
    })
    // socket.removeListener("user-join");
    // socket.removeListener("user-leave");
    // socket.removeListener("game-ping");
  }, [])

  return (
    <motion.div
      className={classes.container}
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.1, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Sidebar lobbyData={lobbyData} />
      <Game lobbyData={lobbyData} />
    </motion.div>
  )
}

export default LobbyGame