import style from "./main.module.css";

import { Fragment, useEffect, useState, createRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";

import JoinableLobby from "./lobby/main.jsx";

import api from "helpers/api";

function Lobbies() {
  const { t } = useTranslation();
  const [lobbies, setLobbies] = useState(null);
  const [resultsReady, setResultsReady] = useState(false);
  const ref = createRef();

  useEffect(() => {
    api.getLobbies(0)
      .then((lobbies) => {
        if (lobbies && lobbies.length > 0) setLobbies(lobbies);
        else setLobbies([]);
        setResultsReady(true);
      })
      .catch((error) => {
        setResultsReady(false);
        setLobbies([]);
        console.log(error);
      });
  }, []);

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
                players={lobby.users}
                maxPlayers={lobby.maxPlayers}
                locked={lobby.isPrivate ? true : false || lobby.users.length >= lobby.maxPlayers}
                category={lobby.category}
                genre={lobby.genre}
                difficulty={lobby.difficulty}
                inviteCode={lobby.inviteCode}
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