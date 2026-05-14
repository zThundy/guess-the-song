import classes from "./main.module.css";

import Users from "./users/main.jsx";

function GameBar({ lobbyData }) {
  return (
    <div className={classes.container}>
      <div className={classes.decoration_container}>
      <Users lobbyData={lobbyData} />
      </div>
    </div>
  )
}

export default GameBar