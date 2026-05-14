import style from "./main.module.css";
import modal from "./modal.module.css";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Lobbies from "./lobbies/main";

import { Button, styled, Paper, Typography, Zoom, IconButton, InputBase, ClickAwayListener } from '@mui/material';
import { Add, Close, Login, East, Refresh } from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { useOnMountUnsafe } from "helpers/remountUnsafe";
import socket from "helpers/socket";
import { t } from "i18next";

import api from "helpers/api";
import { useEventEmitter } from "helpers/eventEmitter";

const StyledButtonPrimary = styled(Button)({
  color: "white",
  background: "radial-gradient(circle, rgba(255,167,51,1) 0%, rgba(255,167,51,1) 50%, rgba(255,167,51,1) 100%)",
  fontWeight: 'bold',
  padding: '1rem',
  fontSize: '2rem',
  minHeight: '6rem',
  boxShadow: '0 9px 0 0 rgba(190,100,0, .8)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  width: '100%',
  bottom: '9px',
  margin: '1rem 0rem 3rem 0rem',
  ":hover": {
    background: "radial-gradient(circle, rgba(235,175,105,1) 0%, rgba(255,183,100,1) 50%, rgba(255,167,51,1) 100%)",
    transition: "all .2s ease",
    boxShadow: '0 0 0 0 rgba(190,100,0, 1)',
    bottom: '0px',
    fontSize: '0rem',
    "& .MuiButton-endIcon": {
      transition: "all .2s ease",
      marginLeft: '0rem',
      opacity: "1",
      width: "4rem",
    },
    "& .MuiSvgIcon-root": {
      width: "4rem",
      height: "4rem",
    }
  },
  "& .MuiButton-endIcon": {
    transition: "all .2s ease",
    marginLeft: '0rem',
    opacity: "0",
    margin: "0rem 0rem 0rem 0rem",
    width: "0rem",
  },
  "& .MuiSvgIcon-root": {
    transition: "all .2s ease",
    width: "4rem",
    height: "4rem",
  }
});

function JoinGameModal({ on, toggle }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const eventEmitter = useEventEmitter();

  const handleJoinGame = () => {
    let message
    const code = inputRef.current.value;
    if (code === "") message = t("JOIN_ERROR_GAME_CODE");
    if (code.length !== 5 && !message) message = t("JOIN_ERROR_CODE_LENGTH");
    if (isNaN(Number(code)) && !message) message = t("JOIN_ERROR_CODE_TYPE");
    api.validateInviteCode(code)
      .then((data) => {
        navigate("/game/" + data.inviteCode, { state: { id: data.inviteCode } });
      })
      .catch((error) => {
        console.log(error);
        if (error.key && !message) message = error.key;
        eventEmitter.emit("notify", "error", t(message || "GENERIC_ERROR"));
      });
  }

  return (
      <Zoom in={on} timeout={300} unmountOnExit>
        <motion.div
          initial={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: "200rem",
          }}
          animate={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "0rem",
          }}
          exit={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: "200rem",
          }}
          // className={"joinGameModal " + (!on ? "fadeOutModal" : "")}
          className={modal.joinGameModal}
        >
          <ClickAwayListener onClickAway={() => toggle(false)}>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1.2, 1] }}
              exit={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className={modal.modalContainer}
            >
              <Button className={modal.modalCloseButton} onClick={() => toggle(false)}>
                <Close />
              </Button>
              <Typography variant="h4" className={modal.modalTitle}>{t("JOIN_GAME_MODAL_TITLE")}</Typography>
              <Typography variant="body1" className={modal.modalText}>{t("JOIN_GAME_MODAL_DESCRIPTION")}</Typography>
              <Paper
                className={modal.modalInput}
                component="form"
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 400
                }}
              >
                <InputBase
                  autoFocus
                  sx={{ ml: 1, flex: 1 }}
                  placeholder={t("JOIN_GAME_MODAL_PLACEHOLDER")}
                  inputProps={{ 'aria-label': 'enter game code' }}
                  inputRef={inputRef}
                  onKeyDown={(e) => {
                    e.preventDefault();
                    if (e.key === "Enter") handleJoinGame();
                    if (e.key === "Escape") toggle(false);
                    if (e.key === "Backspace") inputRef.current.value = inputRef.current.value.slice(0, -1);

                    if (isNaN(Number(e.key))) return;
                    else if (inputRef.current.value.length >= 5) return;
                    else inputRef.current.value += e.key;
                  }}
                />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleJoinGame}>
                  <East />
                </IconButton>
              </Paper>
            </motion.div>
          </ClickAwayListener>
        </motion.div>
      </Zoom>
  );
}

function JoinGame({ status }) {
  const [joinGameToggle, setJoinGameToggle] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const eventEmitter = useEventEmitter();
  const [lobbies, setLobbies] = useState([]);
  const [resultsReady, setResultsReady] = useState(false);
  const [errored, setError] = useState(false);

  const handleLobbyRefresh = (r) => {
    console.log("lobby-refresh", r);
    if (r.data) {
      if (r.data.room && r.data.room.roomUniqueId) {
        switch (r.action) {
          case "delete":
            console.log("deleted lobby", r.data.room.roomUniqueId);
            setLobbies((prev) => {
              let nextLobbies = [...prev];
              if (nextLobbies.find((lobby) => lobby.roomUniqueId === r.data.room.roomUniqueId)) {
                nextLobbies = nextLobbies.filter((lobby) => lobby.roomUniqueId !== r.data.room.roomUniqueId);
                console.log("removed lobby", r.data.room.roomUniqueId);
              }
              return nextLobbies;
            });
            break;
          case "update":
            console.log("upserted lobby", r.data.room);
            setLobbies((prev) => {
              let nextLobbies = [...prev];
              if (nextLobbies.find((lobby) => lobby.roomUniqueId === r.data.room.roomUniqueId)) {
                nextLobbies = nextLobbies.map((lobby) => {
                  if (lobby.roomUniqueId === r.data.room.roomUniqueId) {
                    console.log("updated lobby", r.data.room);
                    lobby.category = r.data.room.category;
                    lobby.difficulty = r.data.room.difficulty;
                    lobby.genre = r.data.room.genre;
                    lobby.inviteCode = r.data.room.inviteCode;
                    lobby.isPrivate = r.data.room.isPrivate;
                    lobby.maxPlayers = r.data.room.maxPlayers;
                    lobby.roomName = r.data.room.roomName;
                    lobby.users = r.data.room.users;
                    lobby.roomOwner = r.data.room.roomOwner;
                    lobby.rounds = r.data.room.rounds;
                    lobby.started = r.data.room.started;
                  }
                  return lobby;
                });
                console.log("updated lobby", nextLobbies);
                return nextLobbies;
              }
              console.log("added lobby", r.data.room);
              nextLobbies.push({
                category: r.data.room.category,
                difficulty: r.data.room.difficulty,
                genre: r.data.room.genre,
                inviteCode: r.data.room.inviteCode,
                isPrivate: r.data.room.isPrivate,
                maxPlayers: r.data.room.maxPlayers,
                roomName: r.data.room.roomName,
                users: r.data.room.users,
                roomUniqueId: r.data.room.roomUniqueId,
                roomOwner: r.data.room.roomOwner,
                rounds: r.data.room.rounds,
                started: r.data.room.started,
              });
              return nextLobbies;
            });
            break;
          default:
            console.log("unknown lobby-refresh action", r.action);
        }
      }
    }
  };

  useOnMountUnsafe(() => {
    getLobbiesAPI();

    // receive single lobby update of the list
    socket.addListener("lobby-refresh", handleLobbyRefresh);

    eventEmitter.on("refreshLobbies", () => {
      getLobbiesAPI();
    })

    return () => {
      socket.removeListener("lobby-refresh");
      eventEmitter.off("refreshLobbies");
    }
  }, []);

  const getLobbiesAPI = () => {
    api.getLobbies(0)
      .then((lobbies) => {
        if (lobbies && lobbies.length > 0) setLobbies(lobbies);
        else setLobbies([]);
        setResultsReady(true);
        setError(false);
      })
      .catch((error) => {
        setResultsReady(false);
        setError(true);
        setLobbies([]);
        eventEmitter.emit("notify", "error", t("ERROR_FETCHING_LOBBIES"));
      });
  }

  const handleJoinGame = () => {
    setTimeout(() => {
      setJoinGameToggle(true);
    }, 200);
  }

  const handleCreateGame = () => {
    setTimeout(() => {
      navigate("/create");
    }, 200);
  }

  const handleRefresh = () => {
    console.log("refresh games")
    // rotate svg on click
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
      refreshButton.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshButton.style.transform = 'rotate(0deg)';
      }, 200);
    }

    socket.removeListener("lobby-refresh");
    socket.addListener("lobby-refresh", handleLobbyRefresh);

    getLobbiesAPI();
  }

  return (
    <>
      <JoinGameModal status={status} on={joinGameToggle} toggle={setJoinGameToggle} />
      <div className={style.joinOrCreateContainer}>
        <div className={style.joinOrCreateButtons}>
          <StyledButtonPrimary variant="contained" endIcon={<Add />} onClick={handleCreateGame}>{t("JOIN_GAME_SCREEN_BUTTON_1")}</StyledButtonPrimary>
          <StyledButtonPrimary variant="contained" endIcon={<Login />} onClick={handleJoinGame}>{t("JOIN_GAME_SCREEN_BUTTON_2")}</StyledButtonPrimary>
          <StyledButtonPrimary variant="contained" sx={{ width: "15rem" }} onClick={handleRefresh}><Refresh className="refresh-button" fontSize="large" /></StyledButtonPrimary>
        </div>
        <div className={style.joinOrCreateListOfLobbies}>
          <Lobbies
            getLobbiesAPI={getLobbiesAPI}
            setResultsReady={setResultsReady}
            setLobbies={setLobbies}
            setError={setError}
            resultsReady={resultsReady}
            lobbies={lobbies}
            errored={errored}
          />
        </div>
      </div>
    </>
  );
}

export default JoinGame;