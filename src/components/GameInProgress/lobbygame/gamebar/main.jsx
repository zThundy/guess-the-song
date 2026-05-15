import classes from "./main.module.css";

import Users from "./users/main.jsx";
import { useEffect, useState } from "react";
import socket from "helpers/socket";

function GameBar({ lobbyData }) {
  const [gameBarData, setGameBarData] = useState(lobbyData || {});

  useEffect(() => {
    console.log("Received new lobbyData, updating gameBarData", lobbyData);
    setGameBarData(lobbyData || {});

    // reset all players points to 0 when new lobby data is received (e.g. new game started)
    setGameBarData(prev => ({
      ...prev,
      users: (lobbyData?.users || []).map(u => ({
        ...u,
        points: 0,
      })),
    }));
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