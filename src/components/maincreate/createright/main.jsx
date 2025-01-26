import "./main.css";

import { useState } from "react";

import { Typography, TextField, Button, styled } from "@mui/material";
import { LockOpen, LockOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StyledButtonPrimary = styled(Button)({
  background: 'linear-gradient(45deg, #ffab2b 30%, #ffc86f 90%)',
  fontWeight: 'bold',
  padding: '1rem',
  fontSize: '2rem',
  minHeight: '6rem',
  boxShadow: '0 3px 5px 2px rgba(255, 169, 41, .3)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  border: "1px solid rgba(204, 102, 0, 1)",
  color: "white",
  width: '100%',
  ":hover": {
    // rotate background gradient
    backgroundPosition: 'left',
    transition: "all .2s ease",
    boxShadow: '0 4px 8px 1px rgba(255, 169, 41, .8)',
  },
});

function CreateLobbyRight({ setGlobalChoices, create }) {
  const { t } = useTranslation();
  const [choices, setChoices] = useState({});

  const handleInputChange = (type, e) => {
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

  const isErrored = () => {
    if (choices.roomName === undefined) return false;
    if (choices.roomName === null) return true;
    return ((choices.roomName !== undefined || choices.roomName !== null) && choices.roomName.length === 0);
  };

  const handleCreate = (e) => {
    if (isErrored()) return;
    if (choices.roomName === undefined) {
      setChoices({ ...choices, roomName: "" });
      setGlobalChoices({ type: "roomName", value: "" });
      return;
    };
    if (choices.maxPlayers === undefined) {
      setChoices({ ...choices, maxPlayers: 8 });
      setGlobalChoices({ type: "maxPlayers", value: 8 });
    }
    if (choices.rounds === undefined) {
      setChoices({ ...choices, rounds: 5 });
      setGlobalChoices({ type: "rounds", value: 5 });
    }
    if (choices.isPrivate === undefined) {
      setChoices({ ...choices, isPrivate: false });
      setGlobalChoices({ type: "isPrivate", value: false });
    }
    create();
  }

  return (
      <div className="createRightContainer">
        <Typography variant="h4" className="createRightTitle">
          {t("CREATE_ROOM_TITLE")}
        </Typography>
        <div className="createRightInputContainer">
          <div className="createRightInput">
            <TextField
              InputLabelProps={{ shrink: true }}
              className="input"
              label={t("CREATE_LABEL_ROOM_NAME").toUpperCase()}
              color="secondary"
              error={isErrored()}
              helperText={isErrored() ? t("CREATE_ERROR_ROOM_NAME") : ""}
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
              InputLabelProps={{ shrink: true }}
              className="input"
              label={t("CREATE_LABEL_MAX_PLAYERS").toUpperCase()}
              color="secondary"
              type="number"
              helperText={t("CREATE_DESCRIPTION_MAX_PLAYERS", [2, 15])}
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
              InputLabelProps={{ shrink: true }}
              className="input"
              label={t("CREATE_LABEL_ROUNDS").toUpperCase()}
              color="secondary"
              type="number"
              helperText={t("CREATE_DESCRIPTION_ROUNDS", [2, 20])}
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
            {t("CREATE_PUBLIC")}
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
            {t("CREATE_PRIVATE")}
            <LockOutlined />
          </Button>
        </div>
        <div className="createButtonSubmitContainer">
          <StyledButtonPrimary
            className="createButtonSubmit"
            variant="contained"
            color="primary"
            size="large"
            onClick={handleCreate}
          >
            {t("CREATE_BUTTON")}
          </StyledButtonPrimary>
        </div>
      </div>
  )
}

export default CreateLobbyRight;