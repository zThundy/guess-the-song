import classes from "./main.module.css";

import Users from "./users/main.jsx";
import { useEffect, useState } from "react";
import socket from "helpers/socket";

function GameBar({ lobbyData }) {
  const [gameBarData, setGameBarData] = useState(lobbyData || {});

  useEffect(() => {
    setGameBarData(lobbyData || {});
  }, [lobbyData]);

  useEffect(() => {
    const handlePointsUpdate = (r) => {
      console.log("points update", r);
      const roomUniqueId = r?.data?.roomUniqueId;
      if (!roomUniqueId) return;

      setGameBarData((prev) => {
        if (String(prev.roomUniqueId) !== String(roomUniqueId)) return prev;

        const usersPoints = r?.data?.usersPoints || [];
        const usersPointsMap = {};
        usersPoints.forEach(up => {
          usersPointsMap[String(up.uniqueId)] = up.points;
        });

        // Ensure numeric comparison and stable tie-breaker by username when points equal
        usersPoints.sort((a, b) => {
          const pa = Number(a?.points || 0);
          const pb = Number(b?.points || 0);
          if (pb !== pa) return pb - pa;

          // tie-breaker: try to use username from current prev.users, fallback to uniqueId
          const ua = ((prev.users || []).find(u => String(u.uniqueId) === String(a.uniqueId)) || {}).username || String(a.uniqueId || '');
          const ub = ((prev.users || []).find(u => String(u.uniqueId) === String(b.uniqueId)) || {}).username || String(b.uniqueId || '');
          return String(ua).localeCompare(String(ub));
        });

        return {
          ...prev,
          users: (prev.users || []).map(u => ({
            ...u,
            points: usersPointsMap[String(u.uniqueId)] !== undefined ? usersPointsMap[String(u.uniqueId)] : u.points,
          })),
        };
      });
    };

    socket.addListener("points-update", handlePointsUpdate);

    return () => {
      socket.removeListener("points-update");
    };
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.decoration_container}>
        <Users lobbyData={gameBarData} />
      </div>
    </div>
  )
}

export default GameBar