import style from "./main.module.css";

import { Avatar, Badge } from "@mui/material";
import { Person } from '@mui/icons-material';
import { useMemo } from "react";
import { getCookie } from 'helpers/cookies'

function User({ lobbyData }) {
  const users = useMemo(() => {
    console.log("Calculating users with points from lobbyData", lobbyData);
    const userId = getCookie('uniqueId');
    const list = (lobbyData.users || []).map((user) => ({
      ...user,
      self: String(user.uniqueId) === String(userId),
    }));

    // sort by points desc, then by username asc for tie-breaker
    list.sort((a, b) => {
      const pa = Number(a?.points || 0);
      const pb = Number(b?.points || 0);
      if (pb !== pa) return pb - pa;
      const na = String(a?.username || '').toLowerCase();
      const nb = String(b?.username || '').toLowerCase();
      return na.localeCompare(nb);
    });

    return list;
  }, [lobbyData]);

  return (
    <>
      {users.map((user, id) => (
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