import classes from "./main.module.css";

import { useEffect, useState } from "react";

import LobbyGame from "./lobbygame/main.jsx";
import Header from "../maingameheader/main.jsx";
import PrelobbyGame from "./prelobbygame/main.jsx";

import { motion } from 'framer-motion';
import { useLocation, useParams, useNavigate } from "react-router-dom";

import api from "helpers/api";
import { isNumber } from "helpers/utils";
import { useEventEmitter } from "helpers/eventEmitter";

function MainGame() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [status, setStatus] = useState("list"); // prelobby, game, create
  const [currentRoom, setCurrentRoom] = useState({});
  const eventEmitter = useEventEmitter();

  const computeLobbyId = () => {
    const _lobbyId = String((location.state && location.state.id) || params.id);
    if (isNumber(_lobbyId)) {
      api.validateInviteCode(_lobbyId)
        .then((data) => {
          setCurrentRoom(data);
          // check if state is prelobby
          if (_lobbyId && location.pathname.includes("game")) {
            setStatus("prelobby");
          }
          // check if state is game
          if (location.state && _lobbyId && location.state.started) {
            setStatus("game");
          }
        })
        .catch((error) => {
          console.error(error);
          setCurrentRoom({});
          navigate("/game");
          eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"));
        });
    } else {
      setCurrentRoom({});
      navigate("/game");
    }
  }

  useEffect(() => {
    computeLobbyId();

    return () => {
      // console.log("cleanup");
      // computeLobbyId();
    }
  }, []);

  return (
    <motion.div
      className={classes.main}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header
        status={status}
        onClickBack={() => {
          api.leaveRoom(currentRoom.roomUniqueId)
            .then(() => {
              setCurrentRoom({});
              navigate("/game");
            })
            .catch((error) => {
              console.error(error);
              setCurrentRoom({});
              navigate("/game");
            });
        }}
      />
      { status === "game" ? <LobbyGame started={status} id={currentRoom.inviteCode} roomUniqueId={currentRoom.roomUniqueId} /> : null }
      { status === "prelobby" ? <PrelobbyGame started={status} id={currentRoom.inviteCode} roomUniqueId={currentRoom.roomUniqueId} /> : null }
    </motion.div>
  )
}

export default MainGame;