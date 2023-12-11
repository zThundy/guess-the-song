import "./main.css";

import { IconButton } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function MainGameHeader({ status }) {
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
  }, [location]);

  const handleBackButton = (event) => {
    setTimeout(() => {
      console.log(location.pathname)
      if (location.pathname === "/game") {
        console.log("navigate to /")
        navigate("/", { state: { shouldAnimate: true } });
        return;
      }
      navigate(-1, { state: { shouldAnimate: true } });
    }, 300);
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