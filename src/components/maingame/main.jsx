import classes from "./main.module.css";

import { useEffect, useState } from "react";

import LobbyGame from "./lobbygame/main.jsx";
import JoinGame from "./joingame/main.jsx";
import Header from "../maingameheader/main.jsx";
import PrelobbyGame from "./prelobbygame/main.jsx";

import { motion } from 'framer-motion';
import { useLocation, useParams } from "react-router-dom";

const api = require("@helpers/api");
const { isNumber } = require("@helpers/utils");

function MainGame() {
  const params = useParams();
  const location = useLocation();
  const [status, setStatus] = useState("list"); // prelobby, game, create, list
  const [lobbyId, setLobbyId] = useState("");

  useEffect(() => {
    const _lobbyId = String((location.state && location.state.id) || params.id);
    if (isNumber(_lobbyId)) {
      api.validateInviteCode(_lobbyId)
        .then((data) => {
          setLobbyId(data.inviteCode);
          if (_lobbyId && location.pathname.includes("game")) {
            setStatus("prelobby");
          }
          if (location.state && _lobbyId && location.state.started) {
            setStatus("game");
          }
        })
        .catch((error) => {
          console.error(error);
          setLobbyId("");
          setStatus("list");
        });
    } else {
      setLobbyId("");
      setStatus("list");
    }
  }, [location]);

  return (
    <motion.div
      className={classes.main}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header
        status={status}
      />
      { status === "game" ? <LobbyGame started={status} id={lobbyId} /> : null }
      { status === "list" ? <JoinGame started={status} /> : null }
      { status === "prelobby" ? <PrelobbyGame started={status} id={lobbyId} /> : null }
    </motion.div>
  )
}

export default MainGame;