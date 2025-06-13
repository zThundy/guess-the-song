import classes from "./main.module.css";

import { useEffect, useState, use, Suspense } from "react";

import Header from "components/Header/main";
import PrelobbyGame from "components/Lobby/prelobbygame/main";

import { motion } from 'framer-motion';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "helpers/api";
import { isNumber } from "helpers/utils";
import { useEventEmitter } from "helpers/eventEmitter";

function Lobby() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentRoom, setCurrentRoom] = useState({});
  const location = useLocation();
  const params = useParams();
  const eventEmitter = useEventEmitter();

  const computeLobbyId = () => {
    const _lobbyId = String((location.state && location.state.id) || params.id);
    if (isNumber(_lobbyId)) {
      api.validateInviteCode(_lobbyId)
        .then((data) => {
          setCurrentRoom(() => { return data });
        })
        .catch((error) => {
          console.error(error);
          eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"))
          setCurrentRoom({});
          navigate("/game");
        });
    } else {
      setCurrentRoom({});
      navigate("/game");
      eventEmitter.emit("notify", "error", t("GENERIC_ERROR"))
    }
  }

  useEffect(() => {
    computeLobbyId();
  }, []);

  return (
    <motion.div
      className={classes.main}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header
        status={"prelobby"}
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

      {currentRoom && currentRoom.inviteCode ? <PrelobbyGame room={currentRoom} /> : null}
    </motion.div>
  )
}

export default Lobby;