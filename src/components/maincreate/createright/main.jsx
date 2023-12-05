import "./main.css";

import { useState } from "react";

import { Typography, TextField, Button } from "@mui/material";
import { LockOpen, LockOutlined } from "@mui/icons-material";

function CreateLobbyRight({ setGlobalChoices }) {
  const [choices, setChoices] = useState({ roomName: "", maxPlayers: 8, rounds: 5, isPrivate: false });

  const handleInputChange = (type, e) => {
    console.log(e.target.value);
    switch (type) {
      case "roomName":
        setChoices({ ...choices, roomName: e.target.value });
        break;
      case "maxPlayers":
        if (e.target.value < 2) e.target.value = 2;
        if (e.target.value > 15) e.target.value = 15;
        setChoices({ ...choices, maxPlayers: e.target.value });
        break;
      case "rounds":
        if (e.target.value < 2) e.target.value = 2;
        if (e.target.value > 20) e.target.value = 20;
        setChoices({ ...choices, rounds: e.target.value });
        break;
      case "isPrivate":
        setChoices({ ...choices, isPrivate: e.target.value });
        break;
      default:
        break;
    }
    setGlobalChoices({ type, value: e.target.value });
  }

  return (
    <div className="createRightContainer">
      <div className="createRightInputContainer">
        <div className="createRightInput">
          <TextField
            className="input"
            label="ROOM NAME"
            color="secondary"
            InputProps={{
              inputProps: { maxLength: 30 },
              fullWidth: true,
            }}
            onChange={(e) => handleInputChange("roomName", e)}
            size="small"
          />
        </div>
        <div className="createRightInput">
          <TextField
            className="input"
            label="MAX PLAYERS"
            color="secondary"
            type="number"
            InputProps={{
              inputProps: { min: 2, max: 15 },
              type: "number",
              fullWidth: true,
            }}
            onChange={(e) => handleInputChange("maxPlayers", e)}
            defaultValue={8}
            size="small"
          />
        </div>
        <div className="createRightInput">
          <TextField
            className="input"
            label="ROUNDS"
            color="secondary"
            type="number"
            InputProps={{
              inputProps: { min: 2, max: 20 },
              type: "number",
              fullWidth: true,
            }}
            onChange={(e) => handleInputChange("rounds", e)}
            defaultValue={5}
            size="small"
          />
        </div>
      </div>
      <div className="createButtonsContainer">
        <Button
          className={"createButton public " + (choices.isPrivate ? "" : "active")}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleInputChange("isPrivate", { target: { value: false } })}
          fullWidth
          disableRipple
        >
          Public
          <LockOpen />
        </Button>
        <Button
          className={"createButton private " + (choices.isPrivate ? "active" : "")}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleInputChange("isPrivate", { target: { value: true } })}
          fullWidth
          disableRipple
        >
          Private
          <LockOutlined />
        </Button>
      </div>
    </div>
  )
}

export default CreateLobbyRight;