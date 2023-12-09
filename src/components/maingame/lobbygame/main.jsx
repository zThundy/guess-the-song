

import Sidebar from "./gamebar/main.jsx";
import Game from "./game/main.jsx";

function LobbyGame({ status }) {
  return (
    <div className="gameContainer">
      <Sidebar />
      <Game />
    </div>
  )
}

export default LobbyGame