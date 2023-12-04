import "./main.css";

import { Button, ButtonGroup } from "@mui/material";
import { LockOutlined, LockOpen } from "@mui/icons-material";

import { useState } from "react";

function JoinableLobby({ name, players, maxPlayers, locked, category, genere }) {
  const [generatedNumber] = useState((Math.floor(Math.random() * 15) + 1));

  return (
    <div className="lobbyContainer">
      <div className="lobbyTextContainer">
        <span className="name">
          <img src={"/assets/vinyl" + generatedNumber + ".png"} alt="vinyl" />
          {name}
        </span>
        <div className="lobbyInfoTextContainer">
          <span className="players">{players} / {maxPlayers}</span>
          <span className="genere">{genere.toUpperCase()}</span>
          <span className="category">{category.toUpperCase()}</span>
        </div>
      </div>
      <ButtonGroup className="joinButtonContainer" variant="contained" aria-label="outlined primary button group">
        <Button className="joinButton" disabled={locked}>Join</Button>
        { locked ? <LockOutlined className="joinLockedIcon" color="error" /> : <LockOpen className="joinLockedIcon" color="success" /> }
      </ButtonGroup>
    </div>
  )
}

export default JoinableLobby;