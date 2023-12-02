import "./main.css";

import { Avatar } from "@mui/material";
import { Person } from '@mui/icons-material';

function User() {
  const users = [
    { name: "User #1", points: 0 },
    { name: "User #2", points: 0 },
    { name: "User #3", points: 0, self: true },
    { name: "User #4", points: 0 },
    { name: "User #5", points: 0 },
    { name: "User #6", points: 0 },
    { name: "User #7", points: 0 },
    { name: "User #8", points: 0 },
    { name: "User #9", points: 0 },
    { name: "User #10", points: 0 },
  ]

  return (
    <>
      {users.map((user, id) => (
        <div className={user.self ? "user self" : "user"} key={id}>
          <Avatar className="avatar">
            <Person fontSize="large" />
          </Avatar>
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