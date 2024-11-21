import "./main.css";

import { IconButton } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function MainGameHeader({ onClickBack, canNavigate = true }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [headerMessage, setHeaderMessage] = useState("");

  useEffect(() => {
    if (location.pathname === "/game") {
      if (location.state && location.state.id) {
        setHeaderMessage(`🎵 ${t("HEADER_LOBBY")} #${location.state.id}`);
      } else {
        setHeaderMessage(`⌛️ ${t("HEADER_SEARCH_FOR_GAME")}`);
      }
    }
    if (location.pathname === "/create") {
      setHeaderMessage(`➕ ${t("HEADER_CREATE_LOBBY")}`);
    }
    if (location.pathname === "/account") {
      setHeaderMessage(`🔒 ${t("HEADER_ACCOUNT_SETTINGS")}`);
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