import style from "./main.module.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, ButtonGroup, Grid, Tooltip } from "@mui/material";
import { LockOutlined, LockOpen, HeadphonesOutlined } from "@mui/icons-material";

import { useEventEmitter } from "helpers/eventEmitter";
import api from "helpers/api";

function JoinableLobby({ name, players, maxPlayers, locked, category, genre, inviteCode, difficulty, started }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [generatedNumber] = useState((Math.floor(Math.random() * 15) + 1));
  const eventEmitter = useEventEmitter();

  const handleJoinGame = () => {
    api.validateInviteCode(inviteCode)
      .then((data) => {
        // console.log(data);
        navigate("/game/" + data.inviteCode, { state: { id: data.inviteCode, roomUniqueId: data.roomUniqueId } });
      })
      .catch((error) => {
        console.log(error);
        eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"));
        if (error.key === "GENERIC_ERROR_ROOM_NOT_FOUND") eventEmitter.emit("refreshLobbies");
      });
  }

  return (
    <div className={style.lobbyContainer}>
      <div className={style.lobbyTextContainer}>
        <span className={style.name}>
          <img src={"/assets/vinyls/vinyl" + generatedNumber + ".png"} alt="vinyl" />
          {name}
        </span>
        <div className={style.lobbyInfoTextContainer}>
          <Grid className={style.playersTable} container>
            <Grid item xs={3} className={style.title}>{t("PLAYERS").toUpperCase()}</Grid>
            <Grid item xs={3} className={style.title}>{t("CATEGORY").toUpperCase()}</Grid>
            <Grid item xs={3} className={style.title}>{t("GENRE").toUpperCase()}</Grid>
            <Grid item xs={3} className={style.title}>{t("DIFFICULTY").toUpperCase()}</Grid>

            <Grid item xs={3}>{players} / {maxPlayers}</Grid>
            <Grid item xs={3}>{category.toUpperCase()}</Grid>
            <Grid item xs={3}>{genre.toUpperCase()}</Grid>
            <Grid item xs={3}>{t("DIFFICULTY_" + difficulty.toString().toUpperCase())}</Grid>
          </Grid>
        </div>
      </div>
      <ButtonGroup className={style.joinButtonContainer} variant="contained" aria-label="outlined primary button group">
        <Button className={style.joinButton} disabled={locked} onClick={handleJoinGame}>{t("JOIN")}</Button>
        {locked ? <Tooltip title={t("CREATE_PRIVATE")} placement="top"><LockOutlined className={style.joinLockedIcon} color="error" /></Tooltip> : <Tooltip title={t("CREATE_PUBLIC")} placement="top"><LockOpen className={style.joinLockedIcon} color="success" /></Tooltip>}
        {started ? <Tooltip title={t("LOBBY_STARTED")} placement="top"><HeadphonesOutlined className={style.joinLockedIcon} color="error" /></Tooltip> : <Tooltip title={t("LOBBY_WAITING")} placement="top"><HeadphonesOutlined className={style.joinLockedIcon} color="success" /></Tooltip>}
      </ButtonGroup>
    </div>
  )
}

export default JoinableLobby;