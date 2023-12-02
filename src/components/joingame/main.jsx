import "./main.css";

import { Button, styled } from '@mui/material';
import { Add, Login } from '@mui/icons-material';

const StyledButtonPrimary = styled(Button)({
  background: "rgb(255,195,125)",
  background: "radial-gradient(circle, rgba(255,195,125,1) 0%, rgba(255,183,100,1) 50%, rgba(255,167,51,1) 100%)",
  fontWeight: 'bold',
  padding: '1rem',
  fontSize: '2rem',
  minHeight: '6rem',
  boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  width: '100%',
  margin: '1rem 0rem 3rem 0rem',
  ":hover": {
    // rotate background gradient
    backgroundPosition: 'left',
    transition: "all .2s ease",
    boxShadow: '0 4px 8px 1px rgba(0, 0, 0, .6)',
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
  return (
    <>
      <div className="joinOrCreateContainer">
        <div className="joinOrCreateButtons">
          <StyledButtonPrimary variant="contained" endIcon={<Add />}>Create a game</StyledButtonPrimary>
          <StyledButtonPrimary variant="contained" endIcon={<Login />}>Join a game</StyledButtonPrimary>
        </div>
        <div className="joinOrCreateListOfLobbies">

        </div>
      </div>
    </>
  );
}

export default JoinGame;