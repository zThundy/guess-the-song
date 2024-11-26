import classes from "./main.module.css";

import { useEffect, useState } from "react";

import JoinGame from "./joingame/main.jsx";
import Header from "../maingameheader/main.jsx";

import { motion } from 'framer-motion';
import { useLocation, useParams } from "react-router-dom";

const api = require("@helpers/api");
const { isNumber } = require("@helpers/utils");

function MainGame() {
  const params = useParams();
  const location = useLocation();
  const [status, setStatus] = useState("list"); // prelobby, game, create, list

  useEffect(() => {
    const _lobbyId = String((location.state && location.state.id) || params.id);
    if (isNumber(_lobbyId)) {
      api.validateInviteCode(_lobbyId)
        .then((data) => {
          if (_lobbyId && location.pathname.includes("game")) {
            setStatus("prelobby");
          }
          if (location.state && _lobbyId && location.state.started) {
            setStatus("game");
          }
        })
        .catch((error) => {
          console.error(error);
          setStatus("list");
        });
    } else {
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
      <Header status={status} />
      <JoinGame started={status} />
    </motion.div>
  )
}

export default MainGame;