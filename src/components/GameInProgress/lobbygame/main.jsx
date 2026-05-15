import classes from "./main.module.css";

import Sidebar from "./gamebar/main.jsx";
import Game from "./game/main.jsx";

import { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from "react-router-dom";

import { getCookie, setCookie } from "helpers/cookies";
import socket from "helpers/socket";

function LobbyGame( ) {
  const location = useLocation();
  const navigate = useNavigate();
  const [lobbyData, setLobbyData] = useState(location.state?.data || {});
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboardReady, setLeaderboardReady] = useState(false);
  const [kickQueued, setKickQueued] = useState(false);
  const roomUniqueIdRef = useRef(String(location.state?.id || location.state?.data?.roomUniqueId || ""));
  const animationIntervalRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const DEFAULT_LEADERBOARD_SECONDS = 10; // default display duration
  const leaderboardDisplaySeconds = Math.max(0, Number(location.state?.displaySeconds ?? location.state?.data?.displaySeconds ?? DEFAULT_LEADERBOARD_SECONDS));

  useEffect(() => {
    roomUniqueIdRef.current = String(location.state?.id || location.state?.data?.roomUniqueId || "");

    if (location.state?.data) {
      setLobbyData(location.state.data);
    }
  }, [location.state]);

  useEffect(() => {
    const clearTimers = () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };

    const normalizeLeaderboard = (entries) => entries
      .map((entry) => {
        const pointsBefore = Number(entry?.pointsBefore ?? 0);
        const roomPoints = Number(entry?.roomPoints ?? 0);
        const pointsAfter = Number(entry?.pointsAfter ?? (pointsBefore + roomPoints));

        return {
          uniqueId: String(entry?.uniqueId || ""),
          username: String(entry?.username || "Player"),
          userImage: String(entry?.userImage || ""),
          pointsBefore,
          roomPoints,
          pointsAfter,
          animatedPoints: pointsBefore,
        };
      })
      .sort((a, b) => {
        if (b.pointsAfter !== a.pointsAfter) return b.pointsAfter - a.pointsAfter;
        if (b.roomPoints !== a.roomPoints) return b.roomPoints - a.roomPoints;
        return a.username.localeCompare(b.username);
      });

    const buildLeaderboardFromRoom = (room) => {
      const roomUsers = Array.isArray(room?.users) ? room.users : [];
      const roomPointsList = Array.isArray(room?.usersPoints) ? room.usersPoints : [];
      const roomPointsMap = roomPointsList.reduce((accumulator, entry) => {
        accumulator[String(entry?.uniqueId || "")] = Number(entry?.points || 0);
        return accumulator;
      }, {});

      return roomUsers.map((user) => {
        const uniqueId = String(user?.uniqueId || "");
        const pointsAfter = Number(user?.points || 0);
        const roomPoints = Number(roomPointsMap[uniqueId] || 0);
        const pointsBefore = Math.max(0, pointsAfter - roomPoints);

        return {
          uniqueId,
          username: String(user?.username || "Player"),
          userImage: String(user?.userImage || ""),
          pointsBefore,
          roomPoints,
          pointsAfter,
        };
      });
    };

    const startLeaderboardAnimation = (entries) => {
      clearTimers();

      const normalized = normalizeLeaderboard(entries);
      setLeaderboardRows(normalized);
      setLeaderboardVisible(true);
      setLeaderboardReady(false);

      if (!normalized.length) {
        setLeaderboardReady(true);
        const currentUserId = String(getCookie("uniqueId") || "");
        const currentUser = normalized.find((row) => String(row.uniqueId) === currentUserId);
        if (currentUser) {
          setCookie("points", currentUser.pointsAfter, 365);
        }
        return;
      }

      const frameMs = 40;
      const animationDurationMs = 2400;
      const frames = Math.max(1, Math.floor(animationDurationMs / frameMs));
      let frame = 0;

      animationIntervalRef.current = setInterval(() => {
        frame += 1;

        setLeaderboardRows((currentRows) => currentRows.map((row, index) => {
          const target = normalized[index];
          if (!target) return row;

          const delta = target.pointsAfter - target.pointsBefore;
          const animatedPoints = Math.min(
            target.pointsAfter,
            Math.round(target.pointsBefore + ((delta * frame) / frames))
          );

          return {
            ...row,
            animatedPoints,
          };
        }));

        if (frame >= frames) {
          clearTimers();
          setLeaderboardRows(normalized.map((row) => ({
            ...row,
            animatedPoints: row.pointsAfter,
          })));
          setLeaderboardReady(true);

          const currentUserId = String(getCookie("uniqueId") || "");
          const currentUser = normalized.find((row) => String(row.uniqueId) === currentUserId);
          if (currentUser) {
            setCookie("points", currentUser.pointsAfter, 365);
          }
        }
      }, frameMs);
    };

    const handleGameEnd = (r) => {
      const roomUniqueId = r?.data?.room?.roomUniqueId || r?.data?.roomUniqueId;
      if (!roomUniqueId || String(roomUniqueIdRef.current) !== String(roomUniqueId)) return;

      const leaderboard = Array.isArray(r?.data?.leaderboard) && r.data.leaderboard.length > 0
        ? r.data.leaderboard
        : buildLeaderboardFromRoom(r?.data?.room);

      startLeaderboardAnimation(leaderboard);
    };

    const handleKickFromRoom = (r) => {
      console.log("kick from room", r);
      const roomUniqueId = r?.data?.roomUniqueId;
      if (!roomUniqueId || String(roomUniqueIdRef.current) !== String(roomUniqueId)) return;

      if (r?.data?.reason !== "game-finished") {
        navigate("/game");
        return;
      }

      setKickQueued(true);
    };

    socket.addListener("game-end", handleGameEnd);
    socket.addListener("kick-from-room", handleKickFromRoom);

    return () => {
      socket.removeListener("game-end");
      socket.removeListener("kick-from-room");
      clearTimers();
    };
  }, [navigate]);

  useEffect(() => {
    if (!leaderboardVisible || !leaderboardReady || !kickQueued) return undefined;

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    redirectTimeoutRef.current = setTimeout(() => {
      navigate("/game");
    }, leaderboardDisplaySeconds * 1000);

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [leaderboardVisible, leaderboardReady, kickQueued, navigate]);

  const currentUserId = String(getCookie("uniqueId") || "");

  return (
    <motion.div
      className={classes.container}
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.1, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Sidebar lobbyData={lobbyData} />
      <Game lobbyData={lobbyData} />
      {leaderboardVisible ? (
        <motion.div
          className={classes.finaleOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <motion.div
            className={classes.finaleCard}
            initial={{ scale: 0.92, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className={classes.finaleKicker}>Fine partita</div>
            <h2 className={classes.finaleTitle}>Leaderboard</h2>
            <p className={classes.finaleSubtitle}>I punti della stanza vengono aggiunti al totale globale.</p>

            <div className={classes.leaderboardList}>
              {leaderboardRows.length > 0 ? leaderboardRows.map((entry, index) => {
                const isSelf = String(entry.uniqueId) === currentUserId;

                return (
                  <div
                    key={entry.uniqueId || `${entry.username}-${index}`}
                    className={classes.leaderboardRow + " " + (isSelf ? classes.leaderboardRowSelf : "")}
                  >
                    <div className={classes.leaderboardRank}>#{index + 1}</div>

                    <div className={classes.leaderboardPlayer}>
                      {entry.userImage ? (
                        <img className={classes.leaderboardAvatar} src={entry.userImage} alt={entry.username} />
                      ) : (
                        <div className={classes.leaderboardAvatarFallback}>{String(entry.username || "?").slice(0, 1).toUpperCase()}</div>
                      )}

                      <div className={classes.leaderboardPlayerMeta}>
                        <span className={classes.leaderboardName}>{entry.username}</span>
                        <span className={classes.leaderboardDelta}>+{entry.roomPoints} punti stanza</span>
                      </div>
                    </div>

                    <div className={classes.leaderboardScore}>
                      <span className={classes.leaderboardScoreLabel}>Totale globale</span>
                      <span className={classes.leaderboardScoreValue}>{entry.animatedPoints}</span>
                      <span className={classes.leaderboardScoreHint}>{entry.pointsBefore} + {entry.roomPoints}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className={classes.leaderboardEmpty}>Nessun punteggio disponibile.</div>
              )}
            </div>

            <div className={classes.finaleFooter}>
              {leaderboardReady ? "Ritorno al menu in corso..." : "Calcolo del risultato in corso..."}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  )
}

export default LobbyGame