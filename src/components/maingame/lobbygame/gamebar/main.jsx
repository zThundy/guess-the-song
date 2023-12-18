import classes from "./main.module.css";

import Users from "./users/main.jsx";

function GameBar() {
  return (
    <div className={classes.container}>
      <Users />
    </div>
  )
}

export default GameBar