import style from "./main.module.css";

import { Avatar, Badge } from "@mui/material";
import { Person } from '@mui/icons-material';
import { useMemo } from "react";

function User({ lobbyData }) {
  // const [users] = useMemo(() => {
  //   const users = [];
  //   for (let i = 0; i < 20; i++) {
  //     users.push({
  //       name: `User #${i + 1}`,
  //       points: Math.floor(Math.random() * 100),
  //       guessed: Math.random() > 0.5,
  //       self: i === 1,
  //     });
  //   }
  //   users.sort((a, b) => b.points - a.points);
  //   return [users];
  // }, []);

  return (
    <>
      {lobbyData.users.map((user, id) => (
        <div className={style.user} key={id}>
          <Badge
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            color="secondary"
            overlap="circular"
            badgeContent={user.self ? "You" : ""}
            invisible={!user.self}
          >
            <Avatar className={`${style.avatar} ${(user.guessed ? style.guessed : "")}`}>
              {/* <Person fontSize="large" /> */}
              {user.userImage && user.userImage.length > 0 ? <img src={user.userImage} alt={user.username} onDragStart={(e) => e.preventDefault()} /> : <Person fontSize="large" />}
            </Avatar>
          </Badge>

          <div className={style.userData}>
            <span>{user.username}</span>
            <span>Points: {user.points}</span>
          </div>
        </div>
      ))}
    </>
  )
}

export default User