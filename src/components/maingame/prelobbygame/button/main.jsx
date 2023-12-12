import "./main.css";

import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

function StartButton() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/game", { state: { started: true, id: "11111" } });
  }

  return (
    <div className="prelobbyButtonContainer">
      <span className="buttonHoverIcon top-left"></span>
      <span className="buttonHoverIcon bottom-left"></span>
      <span className="buttonHoverIcon top-right"></span>
      <span className="buttonHoverIcon bottom-right"></span>

      <Button
        variant='contained'
        className='button'
        color='primary'
        onClick={handleButtonClick}
      >Start Game</Button>
    </div>
  )
}

export default StartButton;