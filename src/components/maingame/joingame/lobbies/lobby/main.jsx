import "./main.css";

import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup } from "@mui/material";
import { LockOutlined, LockOpen } from "@mui/icons-material";

const api = require("@helpers/api");

function JoinableLobby({ name, players, maxPlayers, locked, category, genre, inviteCode }) {
  const navigate = useNavigate();
  const [generatedNumber] = useState((Math.floor(Math.random() * 15) + 1));
  const [playersInLobby] = useState(players);

  const handleJoinGame = () => {
    console.log("Joining game with invite code: " + inviteCode);
    api.validateInviteCode(inviteCode)
      .then((data) => {
        console.log(data);
        navigate("/game", { state: { id: data.inviteCode } });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="lobbyContainer">
      <div className="lobbyTextContainer">
        <span className="name">
          <img src={"/assets/vinyl" + generatedNumber + ".png"} alt="vinyl" />
          {name}
        </span>
        <div className="lobbyInfoTextContainer">
          <span className="players">{playersInLobby.length} / {maxPlayers}</span>
          <span className="genre">{genre.toUpperCase()}</span>
          <span className="category">{category.toUpperCase()}</span>
        </div>
      </div>
      <ButtonGroup className="joinButtonContainer" variant="contained" aria-label="outlined primary button group">
        <Button className="joinButton" disabled={locked} onClick={handleJoinGame}>Join</Button>
        { locked ? <LockOutlined className="joinLockedIcon" color="error" /> : <LockOpen className="joinLockedIcon" color="success" /> }
      </ButtonGroup>
    </div>
  )
}

export default JoinableLobby;