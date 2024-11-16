import "./main.css";

import { IconButton } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function MainGameHeader({ onClickBack, canNavigate = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [headerMessage, setHeaderMessage] = useState("");

  useEffect(() => {
    if (location.pathname === "/game") {
      if (location.state && location.state.id) {
        setHeaderMessage("🎵 Lobby #" + location.state.id);
      } else {
        setHeaderMessage("⌛️ Search for game...");
      }
    }
    if (location.pathname === "/create") {
      setHeaderMessage("➕ Create new lobby");
    }
    if (location.pathname === "/account") {
      setHeaderMessage("🔒 Account settings");
    }
  }, [location]);

  const handleBackButton = (event) => {
    setTimeout(() => {
      if (location.pathname === "/game") {
        if (canNavigate) navigate("/", { state: { shouldAnimate: true } });
        return;
      }
      if (canNavigate) navigate(-1, { state: { shouldAnimate: true } });
    }, 300);

    if (onClickBack) {
      onClickBack({ event, location });
    }
  }

  return (
    <div className="header">
      <IconButton disableRipple className="backButton" aria-label="delete" size="large" onMouseUp={handleBackButton}>
        <ArrowBack fontSize="inherit" />
      </IconButton>

      <span className="title">{headerMessage}</span>
    </div>
  )
}

export default MainGameHeader