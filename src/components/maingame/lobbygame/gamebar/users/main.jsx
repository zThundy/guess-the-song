import "./main.css";

import { Avatar, Badge } from "@mui/material";
import { Person } from '@mui/icons-material';
import { useMemo } from "react";

function User() {
  const [users] = useMemo(() => {
    const users = [];
    for (let i = 0; i < 20; i++) {
      users.push({
        name: `User #${i + 1}`,
        points: Math.floor(Math.random() * 100),
        guessed: Math.random() > 0.5,
        self: i === 1,
      });
    }
    users.sort((a, b) => b.points - a.points);
    return [users];
  }, []);

  return (
    <>
      {users.map((user, id) => (
        <div className="user" key={id}>
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
            <Avatar className={"avatar " + (user.guessed ? "guessed" : "")}>
              <Person fontSize="large" />
            </Avatar>
          </Badge>

          <div className="userData">
            <span>{user.name}</span>
            <span>Points: {user.points}</span>
          </div>
        </div>
      ))}
    </>
  )
}

export default User