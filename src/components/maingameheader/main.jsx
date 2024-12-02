import "./main.css";

import { IconButton } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const api = require("@helpers/api");
const { isNumber } = require("@helpers/utils");

function MainGameHeader({ onClickBack, canNavigate = true }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [headerMessage, setHeaderMessage] = useState("");

  useEffect(() => {
    if (location.pathname.includes("/game")) {
      const _lobbyId = String((location.state && location.state.id) || params.id);
      if (_lobbyId && _lobbyId.length > 0) {
        if (isNumber(_lobbyId)) {
          setHeaderMessage(`🎵 ${t("HEADER_LOBBY")} #${_lobbyId}`);
        } else {
          setHeaderMessage(`⌛️ ${t("HEADER_SEARCH_FOR_GAME")}`);
        }
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
      if (!canNavigate) return;
      if (location.pathname.includes("/game") || location.pathname.includes("/account")) {
        const reg = /\/game\/[0-9]{5}/s;
        if (reg.test(location.pathname)) {
          navigate("/game", { state: { shouldAnimate: true } });
        } else {
          navigate("/", { state: { shouldAnimate: true } });
        }
      } else {
        navigate(-1, { state: { shouldAnimate: true } });
      }
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