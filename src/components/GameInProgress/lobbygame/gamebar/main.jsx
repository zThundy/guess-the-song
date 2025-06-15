import classes from "./main.module.css";

import Users from "./users/main.jsx";

function GameBar({ lobbyData }) {
  return (
    <div className={classes.container}>
      <Users lobbyData={lobbyData} />
    </div>
  )
}

export default GameBar