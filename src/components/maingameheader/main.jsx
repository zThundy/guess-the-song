import "./main.css";

import { IconButton, Avatar } from "@mui/material";
import { ArrowBack, Person, DoDisturb } from '@mui/icons-material';

import { useNavigate } from "react-router-dom";

function MainGameHeader({ started }) {
  const navigate = useNavigate();

  const handleBackButton = (event) => {
    setTimeout(() => {
      navigate("/", { state: { shouldAnimate: true } });
    }, 300);
  }

  return (
    <div className="header">
      <IconButton disableRipple className="backButton" aria-label="delete" size="large" onMouseDown={handleBackButton}>
        <ArrowBack fontSize="inherit" />
      </IconButton>

      <span className="title">{ started ? "🎵 Lobby #233" : "Waiting for game..." }</span>

      <Avatar className={ started ? "avatar" : "avatar gray" }>
        { started ? <Person fontSize="large" /> : <DoDisturb fontSize="large" /> }
      </Avatar>
    </div>
  )
}

export default MainGameHeader