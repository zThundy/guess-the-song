import "./main.css";

import { Avatar, Badge } from "@mui/material";
import { Person } from '@mui/icons-material';

function User() {
  const users = [
    { name: "User #1", points: 0, guessed: false },
    { name: "User #2", points: 0, guessed: false },
    { name: "User #3", points: 0, self: true, guessed: false },
    { name: "User #4", points: 0, guessed: false },
    { name: "User #5", points: 0, guessed: true },
    { name: "User #6", points: 0, guessed: false },
    { name: "User #7", points: 0, guessed: false },
    { name: "User #8", points: 0, guessed: false },
    { name: "User #9", points: 0, guessed: false },
    { name: "User #10", points: 0, guessed: false },
  ]

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
            badgeContent="You"
            invisible={!user.self}
          >
            <Avatar className="avatar">
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