import "./main.css";

import { Button, styled } from '@mui/material';
import { Add, Login } from '@mui/icons-material';

import Lobbies from "./lobbies/main";

const StyledButtonPrimary = styled(Button)({
  color: "white",
  background: "radial-gradient(circle, rgba(255,167,51,1) 0%, rgba(255,167,51,1) 50%, rgba(255,167,51,1) 100%)",
  fontWeight: 'bold',
  padding: '1rem',
  fontSize: '2rem',
  minHeight: '6rem',
  boxShadow: '0 9px 0 0 rgba(190,100,0, .8)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  width: '100%',
  bottom: '9px',
  margin: '1rem 0rem 3rem 0rem',
  ":hover": {
    background: "radial-gradient(circle, rgba(235,175,105,1) 0%, rgba(255,183,100,1) 50%, rgba(255,167,51,1) 100%)",
    transition: "all .2s ease",
    boxShadow: '0 0 0 0 rgba(190,100,0, 1)',
    bottom: '0px',
    fontSize: '0rem',
    "& .MuiButton-endIcon": {
      transition: "all .2s ease",
      marginLeft: '0rem',
      opacity: "1",
      width: "4rem",
    },
    "& .MuiSvgIcon-root": {
      width: "4rem",
      height: "4rem",
    }
  },
  "& .MuiButton-endIcon": {
    transition: "all .2s ease",
    marginLeft: '0rem',
    opacity: "0",
    margin: "0rem 0rem 0rem 0rem",
    width: "0rem",
  },
  "& .MuiSvgIcon-root": {
    transition: "all .2s ease",
    width: ".5rem",
    height: ".5rem",
  }
});

function JoinGame() {
  const handleCreateGame = () => {
    console.log("create game");
  }

  const handleJoinGame = () => {
    console.log("join game");
  }

  return (
    <>
      <div className="joinOrCreateContainer">
        <div className="joinOrCreateButtons">
          <StyledButtonPrimary variant="contained" endIcon={<Add />} onClick={handleCreateGame}>Create a game</StyledButtonPrimary>
          <StyledButtonPrimary variant="contained" endIcon={<Login />} onClick={handleJoinGame}>Join a game</StyledButtonPrimary>
        </div>
        <div className="joinOrCreateListOfLobbies">
          <Lobbies />
        </div>
      </div>
    </>
  );
}

export default JoinGame;