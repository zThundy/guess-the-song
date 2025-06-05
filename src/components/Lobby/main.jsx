import classes from "./main.module.css";

import { useEffect, useState, use, Suspense } from "react";

import Header from "components/Header/main";
import PrelobbyGame from "components/Lobby/prelobbygame/main";

import { motion } from 'framer-motion';
import { useLocation, useParams, useNavigate } from "react-router-dom";

import api from "helpers/api";
import { isNumber } from "helpers/utils";
import { useEventEmitter } from "helpers/eventEmitter";

async function fetchLobbyData() {
  const location = useLocation();
  const params = useParams();
  const eventEmitter = useEventEmitter();

  const _lobbyId = String((location.state && location.state.id) || params.id);
  if (isNumber(_lobbyId)) {
    try {
      return await api.validateInviteCode(_lobbyId)
    } catch(e) {
      eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"));
      return false
    }
    // api.validateInviteCode(_lobbyId)
    //   .then((data) => {
    //     setCurrentRoom(() => { return data });
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     setCurrentRoom({});
    //     navigate("/game");
    //   });
  } else {
    // setCurrentRoom({});
    // navigate("/game");
    return false
  }
}

function Loading() {
  return (
    <>Loading...</>
  )
}

function MainGame() {
  const navigate = useNavigate();
  // const [currentRoom, setCurrentRoom] = useState({});
  const currentRoom = use(fetchLobbyData())

  const computeLobbyId = () => {
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
      <Suspense fallback={<Loading />}>
        <PrelobbyGame room={currentRoom} />
      </Suspense>
    </motion.div>
  )
}

export default MainGame;