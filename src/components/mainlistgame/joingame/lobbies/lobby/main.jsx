import style from "./main.module.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, ButtonGroup, Grid } from "@mui/material";
import { LockOutlined, LockOpen } from "@mui/icons-material";

import api from "helpers/api";

function JoinableLobby({ name, players, maxPlayers, locked, category, genre, inviteCode, difficulty }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [generatedNumber] = useState((Math.floor(Math.random() * 15) + 1));
  const [playersInLobby] = useState(players);

  const handleJoinGame = () => {
    api.validateInviteCode(inviteCode)
      .then((data) => {
        console.log(data);
        navigate("/game/" + data.inviteCode, { state: { id: data.inviteCode } });
      })
      .catch((error) => {
        console.log(error);
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

            <Grid item xs={3}>{playersInLobby.length} / {maxPlayers}</Grid>
            <Grid item xs={3}>{category.toUpperCase()}</Grid>
            <Grid item xs={3}>{genre.toUpperCase()}</Grid>
            <Grid item xs={3}>{t("DIFFICULTY_" + difficulty.toString().toUpperCase())}</Grid>
          </Grid>
        </div>
      </div>
      <ButtonGroup className={style.joinButtonContainer} variant="contained" aria-label="outlined primary button group">
        <Button className={style.joinButton} disabled={locked} onClick={handleJoinGame}>{t("JOIN")}</Button>
        {locked ? <LockOutlined className={style.joinLockedIcon} color="error" /> : <LockOpen className={style.joinLockedIcon} color="success" />}
      </ButtonGroup>
    </div>
  )
}

export default JoinableLobby;