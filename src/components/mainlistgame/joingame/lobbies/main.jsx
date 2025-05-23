import style from "./main.module.css";

import { Fragment, useEffect, useState, createRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";

import JoinableLobby from "./lobby/main.jsx";

import api from "helpers/api";
import socket from "helpers/socket";
import { useOnMountUnsafe } from "helpers/remountUnsafe";

function Lobbies() {
  const { t } = useTranslation();
  const [lobbies, setLobbies] = useState(null);
  const [resultsReady, setResultsReady] = useState(false);
  const [errored, setError] = useState(false);
  const ref = createRef();

  useOnMountUnsafe(() => {
    api.getLobbies(0)
      .then((lobbies) => {
        if (lobbies && lobbies.length > 0) setLobbies(lobbies);
        else setLobbies([]);
        setResultsReady(true);
        setError(false);
      })
      .catch((error) => {
        setResultsReady(false);
        setError(true);
        setLobbies([]);
        console.log(error);
      });

    // receive single lobby update of the list
    socket.addListener("lobby-refresh", (r) => {
      console.log("lobby-refresh", r);
      if (r.data) {
        if (r.data.room && r.data.room.roomUniqueId) {
          switch (r.action) {
            case "delete":
              setLobbies((prev) => {
                let lobbies = [...prev];
                // check if lobby exists
                if (lobbies.find((lobby) => lobby.roomUniqueId === r.data.room.roomUniqueId)) {
                  // remove lobby
                  lobbies = lobbies.filter((lobby) => lobby.roomUniqueId !== r.data.room.roomUniqueId);
                  console.log("removed lobby", r.data.room.roomUniqueId);
                }
                return lobbies;
              });
              break;
            case "update":
              setLobbies((prev) => {
                let lobbies = [...prev];
                if (lobbies.find((lobby) => lobby.roomUniqueId === r.data.room.roomUniqueId)) {
                  // update lobby
                  lobbies = lobbies.map((lobby) => {
                    if (lobby.roomUniqueId === r.data.room.roomUniqueId) {
                      console.log("updated lobby", r.data.room);
                      lobby.category = r.data.room.category;
                      lobby.difficulty = r.data.room.difficulty;
                      lobby.genre = r.data.room.genre;
                      lobby.inviteCode = r.data.room.inviteCode;
                      lobby.isPrivate = r.data.room.isPrivate;
                      lobby.maxPlayers = r.data.room.maxPlayers;
                      lobby.roomName = r.data.room.roomName;
                      lobby.users = r.data.room.users;
                      lobby.roomOwner = r.data.room.roomOwner;
                      lobby.rounds = r.data.room.rounds;
                    }
                    return lobby;
                  });
                  console.log("updated lobby", lobbies);
                  return lobbies;
                }
                console.log("added lobby", r.data.room);
                // add lobby
                lobbies.push({
                  category: r.data.room.category,
                  difficulty: r.data.room.difficulty,
                  genre: r.data.room.genre,
                  inviteCode: r.data.room.inviteCode,
                  isPrivate: r.data.room.isPrivate,
                  maxPlayers: r.data.room.maxPlayers,
                  roomName: r.data.room.roomName,
                  users: r.data.room.users,
                  roomUniqueId: r.data.room.roomUniqueId,
                  roomOwner: r.data.room.roomOwner,
                  rounds: r.data.room.rounds,
                });
                return lobbies;
              })
              break;
          }
        }
      }
    });
  }, []);

  // maybe redo? idk
  useEffect(() => {
    if (errored) {
      const refreshInterval = setInterval(() => {
        api.getLobbies(0)
          .then((lobbies) => {
            if (lobbies && lobbies.length > 0) setLobbies(lobbies);
            else setLobbies([]);
            setResultsReady(true);
            setError(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }, 5000);
      return () => {
        clearInterval(refreshInterval);
      }
    }
  }, [errored]);

  useEffect(() => {
    if (!resultsReady) return;
    if (!ref.current) return;

    const handleScroll = () => {
      if (ref.current) {
        const { scrollTop, scrollHeight, clientHeight } = ref.current;
        if (scrollTop + clientHeight >= scrollHeight) {
          // if the result is a multiple of 10, fetch more lobbies with the offset
          if (lobbies.length % 10 === 0) {
            api.getLobbies(lobbies.length)
              .then((newLobbies) => {
                if (newLobbies.length > 0) setLobbies([...lobbies, ...newLobbies]);
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      }
    };

    const lobbiesContainer = ref.current;
    lobbiesContainer.addEventListener('scroll', handleScroll);

    return () => {
      lobbiesContainer.removeEventListener('scroll', handleScroll);
    };
  }, [resultsReady, ref]);

  return (
    <>
      {resultsReady && (lobbies && lobbies.length > 0) ?
        <div className={style.lobbiesContainer} ref={ref}>
          {
            lobbies.map((lobby, index) => (
              <JoinableLobby
                key={index}
                name={lobby.roomName}
                players={lobby.users.length}
                maxPlayers={lobby.maxPlayers}
                locked={lobby.isPrivate ? true : false || lobby.users.length >= lobby.maxPlayers}
                category={lobby.category}
                genre={lobby.genre}
                difficulty={lobby.difficulty}
                inviteCode={lobby.inviteCode}
                started={lobby.started}
              />
            ))
          }
        </div>
        : null
      }
      {!resultsReady ?
        <div className={style.loadingContainer}>
          <div className={style.loadingSpinner}>
            <Fragment>
              <svg width={0} height={0}>
                <defs>
                  <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(255, 174, 94)" />
                    <stop offset="100%" stopColor="rgb(204,102,0)" />
                  </linearGradient>
                </defs>
              </svg>
              <CircularProgress sx={{ 'svg circle': { stroke: 'url(#spinnerGrad)' } }} size={80} />
            </Fragment>
          </div>
          <span className={style.loadingText}>{t("LOADING")}</span>
        </div>
        : null}
    </>
  )
}

export default Lobbies;