import "./main.css";

import { IconButton, Avatar } from "@mui/material";
import { ArrowBack, Person } from '@mui/icons-material';

import { useNavigate } from "react-router-dom";

function MainGameHeader() {
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

      <Avatar className="avatar">
        <Person fontSize="large" />
      </Avatar>
    </div>
  )
}

export default MainGameHeader