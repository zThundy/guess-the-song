import "./main.css";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Lobbies from "./lobbies/main";

import { Button, styled, Paper, Typography, Zoom, IconButton, InputBase, ClickAwayListener } from '@mui/material';
import { Add, Close, Login, East } from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { t } from "i18next";

import api from "helpers/api";

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
    width: ".5rem",
    height: ".5rem",
  }
});

function JoinGameModal({ on, toggle }) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (on) setSubmitted(false);
  }, [on]);

  const handleJoinGame = () => {
    const code = inputRef.current.value;
    if (code === "") return setSubmitted(t("JOIN_ERROR_GAME_CODE"));
    if (code.length !== 5) return setSubmitted(t("JOIN_ERROR_CODE_LENGTH"));
    if (isNaN(Number(code))) return setSubmitted(t("JOIN_ERROR_CODE_TYPE"));
    api.validateInviteCode(code)
      .then((data) => {
        navigate("/game/" + data.inviteCode, { state: { id: data.inviteCode } });
      })
      .catch((error) => {
        console.log(error);
        setSubmitted(t(error.key));
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
        className={"joinGameModal " + (!on ? "fadeOutModal" : "")}
      >
        <ClickAwayListener onClickAway={() => toggle(false)}>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1.2, 1] }}
            exit={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="modalContainer"
          >
            <Button className="modalCloseButton" onClick={() => toggle(false)}>
              <Close />
            </Button>
            <Typography variant="h4" className="modalTitle">{t("JOIN_GAME_MODAL_TITLE")}</Typography>
            <Typography variant="body1" className="modalText">{t("JOIN_GAME_MODAL_DESCRIPTION")}</Typography>
            <Paper
              className="modalInput"
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
                onChange={() => setSubmitted(false)}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if (e.key === "Enter") handleJoinGame();
                  if (e.key === "Escape") toggle(false);
                  if (e.key === "Backspace") inputRef.current.value = inputRef.current.value.slice(0, -1);

                  if (isNaN(Number(e.key))) return;
                  // else if (inputRef.current.value.length >= 5) return;
                  else inputRef.current.value += e.key;
                }}
              />
              <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleJoinGame}>
                <East />
              </IconButton>
            </Paper>
            { submitted ? <Typography variant="body1" className="modalError">{submitted}</Typography> : null }
          </motion.div>
        </ClickAwayListener>
      </motion.div>
    </Zoom>
  );
}

function JoinGame({ status }) {
  const [joinGameToggle, setJoinGameToggle] = useState(false);
  const navigate = useNavigate();

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

  return (
    <>
      <JoinGameModal status={status} on={joinGameToggle} toggle={setJoinGameToggle} />
      <div className="joinOrCreateContainer">
        <div className="joinOrCreateButtons">
          <StyledButtonPrimary variant="contained" endIcon={<Add />} onClick={handleCreateGame}>{t("JOIN_GAME_SCREEN_BUTTON_1")}</StyledButtonPrimary>
          <StyledButtonPrimary variant="contained" endIcon={<Login />} onClick={handleJoinGame}>{t("JOIN_GAME_SCREEN_BUTTON_2")}</StyledButtonPrimary>
        </div>
        <div className="joinOrCreateListOfLobbies">
          <Lobbies />
        </div>
      </div>
    </>
  );
}

export default JoinGame;