import "./main.css";

import { IconButton } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

import { useLocation, useNavigate } from "react-router-dom";

function MainGameHeader({ status }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBackButton = (event) => {
    setTimeout(() => {
      if (location.pathname === "/game") {
        navigate("/", { state: { shouldAnimate: true } });
        return;
      }
      navigate(-1, { state: { shouldAnimate: true } });
    }, 300);
  }

  return (
    <div className="header">
      <IconButton disableRipple className="backButton" aria-label="delete" size="large" onMouseDown={handleBackButton}>
        <ArrowBack fontSize="inherit" />
      </IconButton>

      { status === "game" ? <span className="title">🎵 Lobby #233</span> : "" }
      { status === "lobby" ? <span className="title">⌛️ Searching for game...</span> : "" }
      { status === "create" ? <span className="title">➕ Create a new lobby</span> : "" }
    </div>
  )
}

export default MainGameHeader