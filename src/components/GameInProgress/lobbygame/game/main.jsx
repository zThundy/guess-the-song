import classes from "./main.module.css";

import { useEffect, useRef, useState } from "react";

import { Box, Button, LinearProgress, Slider, styled, Typography } from "@mui/material";

import api from "helpers/api";
import { getCookie } from "helpers/cookies";
import socket from "helpers/socket";
import { t } from "i18next";

const StyledVolumeContainer = styled(Box)(({ theme }) => ({
  width: "50%",
  mx: "auto",
  mb: 2,
  color: "white",
  backgroundColor: theme.palette.primary.main,
  borderRadius: ".5rem",
  padding: theme.spacing(2),
  border: `2px solid white`,
  "& .MuiTypography-root": {
    color: theme.palette.common.white,
    fontWeight: "bold",
    fontSize: "1.25rem",
    textAlign: "center",
  },
  "& .MuiSlider-root": {
    color: theme.palette.secondary.main,
  },
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 4,
  width: "90%",
  margin: "0 auto 2rem auto",
  backgroundColor: theme.palette.primary.main,
  [theme.breakpoints.up("sm")]: {
    width: "70%",
  },
  [theme.breakpoints.up("md")]: {
    width: "80%",
  },
  [theme.breakpoints.up("lg")]: {
    width: "90%",
  },
}));

const StyledButtonPrimary = styled(Button)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1rem',
  boxShadow: '0 9px 0 0 rgba(190,100,0, .8)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  bottom: '9px',
  ":hover": {
    background: theme.palette.secondary[900],
    transition: "all .2s ease",
    boxShadow: '0 0 0 0 rgba(190, 100, 0, 1)',
    bottom: '0px',
  },
}));

function Game({ lobbyData = {} }) {
  const [guessed, setGuessed] = useState("0");
  const [generatedNumber] = useState((Math.floor(Math.random() * 15) + 1));
  const [choices, setChoices] = useState([
    { id: "1", name: "Loading..." },
    { id: "2", name: "Loading..." },
    { id: "3", name: "Loading..." },
    { id: "4", name: "Loading..." },
  ]);
  const [audioUrl, setAudioUrl] = useState("");
  const [musicStatus, setMusicStatus] = useState("waiting");
  const [volume, setVolume] = useState(20);
  const [durationSec, setDurationSec] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const audioRef = useRef(null);
  const chunkBufferRef = useRef([]);
  const streamMetaRef = useRef({ roomUniqueId: "", streamId: "", startAt: 0 });
  const playbackTimerRef = useRef(null);
  const readySentRef = useRef(false);
  const objectUrlRef = useRef("");
  const fadeOutWindowSec = 2.5;
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [countdownValue, setCountdownValue] = useState(null);
  const [pointsVisible, setPointsVisible] = useState(false);
  const [pointsExiting, setPointsExiting] = useState(false);
  const [pointsAnimatedValue, setPointsAnimatedValue] = useState(0);
  const [roundEnded, setRoundEnded] = useState(false);
  const [roundReadySent, setRoundReadySent] = useState(false);
  const [songCoverUrl, setSongCoverUrl] = useState("");
  const [correctChoiceId, setCorrectChoiceId] = useState("");
  const pointsTimerRef = useRef(null);
  const pointsHideTimerRef = useRef(null);
  const pointsCountIntervalRef = useRef(null);
  const songCoverUrlRef = useRef("");
  const dingAudioRef = useRef(null);

  const sendMusicReady = () => {
    if (!lobbyData?.roomUniqueId || readySentRef.current) {
      return;
    }

    console.log("GAME-LOG", "Sending music-ready to server for room:", lobbyData.roomUniqueId);
    readySentRef.current = true;
    socket.send({
      type: "music-ready",
      data: {
        roomUniqueId: lobbyData.roomUniqueId,
        uniqueId: getCookie("uniqueId") || "",
        inviteCode: lobbyData.inviteCode || "",
      },
    });
  };

  const base64ToUint8Array = (base64) => {
    const binaryString = window.atob(base64);
    const buffer = new Uint8Array(binaryString.length);
    for (let index = 0; index < binaryString.length; index += 1) {
      buffer[index] = binaryString.charCodeAt(index);
    }
    return buffer;
  };

  const schedulePlayback = (startAt) => {
    if (!audioRef.current || !objectUrlRef.current) return;

    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
    }

    const delay = Math.max(0, startAt - Date.now());
    playbackTimerRef.current = setTimeout(() => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.volume = Math.min(1, Math.max(0, volume / 100));
      audioRef.current.play().catch((error) => {
        console.error("Music playback blocked:", error);
        setMusicStatus("playback-blocked");
      });
    }, delay);
  };

  const clearSongCoverUrl = () => {
    if (songCoverUrlRef.current) {
      URL.revokeObjectURL(songCoverUrlRef.current);
      songCoverUrlRef.current = "";
    }
    setSongCoverUrl("");
  };

  const playCountdownDing = () => {
    try {
      if (!dingAudioRef.current) {
        dingAudioRef.current = new Audio("/assets/sounds/ding.mp3");
      }
      console.log("COUNTDOWN-DING-LOG", {
        event: "attempt-play",
        src: dingAudioRef.current.currentSrc || dingAudioRef.current.src || "",
        readyState: dingAudioRef.current.readyState,
        networkState: dingAudioRef.current.networkState,
      });
      dingAudioRef.current.currentTime = 0;
      dingAudioRef.current.play().catch((error) => {
        console.error("COUNTDOWN-DING-LOG", {
          event: "play-rejected",
          name: error?.name,
          message: error?.message,
          src: dingAudioRef.current?.currentSrc || dingAudioRef.current?.src || "",
        });
      });
    } catch (error) {
      console.error("COUNTDOWN-DING-LOG", {
        event: "play-throw",
        name: error?.name,
        message: error?.message,
        src: dingAudioRef.current?.currentSrc || dingAudioRef.current?.src || "",
      });
    }
  };

  useEffect(() => {
    const ding = new Audio("/assets/sounds/ding.mp3");
    dingAudioRef.current = ding;

    const onDingCanPlay = () => {
      console.log("COUNTDOWN-DING-LOG", {
        event: "canplay",
        src: ding.currentSrc || ding.src || "",
      });
    };
    const onDingError = () => {
      const mediaError = ding.error;
      console.error("COUNTDOWN-DING-LOG", {
        event: "media-error",
        code: mediaError?.code,
        message: mediaError?.message || "",
        src: ding.currentSrc || ding.src || "",
      });
    };

    ding.addEventListener("canplay", onDingCanPlay);
    ding.addEventListener("error", onDingError);

    return () => {
      ding.removeEventListener("canplay", onDingCanPlay);
      ding.removeEventListener("error", onDingError);
      ding.pause();
      dingAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lobbyData?.roomUniqueId || readySentRef.current) {
      return undefined;
    }

    sendMusicReady();

    return undefined;
  }, [lobbyData?.roomUniqueId, lobbyData?.inviteCode]);

  useEffect(() => {
    const handleMusicStart = (r) => {
      if (r.data.roomUniqueId !== lobbyData?.roomUniqueId) return;

      chunkBufferRef.current = [];
      streamMetaRef.current = {
        roomUniqueId: r.data.roomUniqueId,
        streamId: r.data.streamId,
        startAt: r.data.startAt,
      };

      setMusicStatus("buffering");
      setRoundEnded(false);
      setRoundReadySent(false);
      clearSongCoverUrl();
      setCorrectChoiceId("");
      setChoices((r.data.choiceNames || []).map((name, index) => ({
        id: r.data.choiceIds?.[index] || String(index + 1),
        name,
      })));

      if (objectUrlRef.current) {
        schedulePlayback(r.data.startAt);
      }
    };

    const handleMusicChunk = (r) => {
      if (r.data.roomUniqueId !== lobbyData?.roomUniqueId) return;
      if (streamMetaRef.current.streamId && r.data.streamId !== streamMetaRef.current.streamId) return;

      chunkBufferRef.current[r.data.chunkIndex] = r.data.chunk;
    };

    const handleMusicEnd = (r) => {
      if (r.data.roomUniqueId !== lobbyData?.roomUniqueId) return;
      if (streamMetaRef.current.streamId && r.data.streamId !== streamMetaRef.current.streamId) return;

      const audioBytes = chunkBufferRef.current
        .filter(Boolean)
        .map(base64ToUint8Array);
      const totalLength = audioBytes.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      audioBytes.forEach((chunk) => {
        combined.set(chunk, offset);
        offset += chunk.length;
      });

      const blob = new Blob([combined], { type: "audio/mpeg" });
      const nextAudioUrl = URL.createObjectURL(blob);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = nextAudioUrl;
      setAudioUrl(nextAudioUrl);
      setMusicStatus("ready");

      if (streamMetaRef.current.startAt) {
        schedulePlayback(streamMetaRef.current.startAt);
      }
    };

    const handleCountdownTick = (r) => {
      console.log("Received countdown-tick event:", r);
      if (r.data.roomUniqueId !== lobbyData?.roomUniqueId) return;
      const v = Number(r.data.value || 0);
      if (!v) return;
      setCountdownValue(v);
      setCountdownVisible(true);
      playCountdownDing();
      if (v === 1) {
        socket.send({ type: 'countdown-ready', data: { roomUniqueId: lobbyData.roomUniqueId, uniqueId: getCookie('uniqueId') || '' } });
      }
    };

    const handleCountdownGo = (r) => {
      console.log("Received countdown-go event:", r);
      if (r.data.roomUniqueId !== lobbyData?.roomUniqueId) return;
      setTimeout(() => {
        setCountdownVisible(false);
        setCountdownValue(null);
      }, 1000);
    };

    const handleRoundStart = (r) => {
      if (r.data.roomUniqueId !== lobbyData?.roomUniqueId) return;
      console.log("GAME-LOG", "New round started, resetting round states");
      // Reset round-related states for the new round
      setRoundEnded(false);
      setRoundReadySent(false);
      setGuessed("0");
      clearSongCoverUrl();
      setCorrectChoiceId("");

      // Re-arm and send music-ready for this new round.
      readySentRef.current = false;
      sendMusicReady();
    };

    socket.addListener("music-start", handleMusicStart);
    socket.addListener("music-chunk", handleMusicChunk);
    socket.addListener("music-end", handleMusicEnd);
    socket.addListener("countdown-tick", handleCountdownTick);
    socket.addListener("countdown-go", handleCountdownGo);
    socket.addListener("round-start", handleRoundStart);

    return () => {
      socket.removeListener("music-start");
      socket.removeListener("music-chunk");
      socket.removeListener("music-end");
      socket.removeListener("countdown-tick");
      socket.removeListener("countdown-go");
      socket.removeListener("round-start");

      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
    };
  }, [lobbyData?.roomUniqueId]);

  // Send ready-for-next-round when round ends and overlay disappears
  useEffect(() => {
    // If round has ended, points overlay has disappeared, and we haven't sent the ready message yet
    if (roundEnded && !pointsVisible && !roundReadySent && lobbyData?.roomUniqueId) {
      console.log("GAME-LOG", "Sending ready-for-next-round to server for room:", lobbyData.roomUniqueId);
      setRoundReadySent(true);
      setTimeout(() => {
        socket.send({
          type: "ready-for-next-round",
          data: {
            roomUniqueId: lobbyData.roomUniqueId,
            uniqueId: getCookie("uniqueId") || "",
          },
        });
      }, 500);
    }
  }, [roundEnded, pointsVisible, roundReadySent]);

  const handleGuess = (e) => {
    if (guessed !== "0") return;
    const guess = e.currentTarget.dataset.guess;
    setGuessed(guess);

    const playbackMs = audioRef.current ? Math.max(0, Math.floor((audioRef.current.currentTime || 0) * 1000)) : 0;
    const selectedAnswer = choices.find((choice) => String(choice.id) === String(guess))?.name || guess;

    api.submitRoomAnswer(lobbyData.roomUniqueId, selectedAnswer, playbackMs)
      .then((result) => {
        console.log("ANSWER-LOG", result);
        const correctSongId = String(result?.correctSongId || result?.result?.correctSongId || "");
        const correctAnswerName = String(result?.result?.correctAnswer || "").trim().toLowerCase();
        const isCorrect = Boolean(result?.result?.correct);

        if (!isCorrect && correctSongId) {
          const matchedChoice = choices.find((choice) => {
            const byId = String(choice?.id || "") === correctSongId;
            const byName = String(choice?.name || "").trim().toLowerCase() === correctAnswerName;
            return byId || byName;
          });
          setCorrectChoiceId(String(matchedChoice?.id || correctSongId));
        } else if (!isCorrect && correctAnswerName) {
          const matchedChoice = choices.find(
            (choice) => String(choice?.name || "").trim().toLowerCase() === correctAnswerName
          );
          setCorrectChoiceId(String(matchedChoice?.id || ""));
        } else {
          setCorrectChoiceId("");
        }

        if (correctSongId) {
          api.getSongPictureUrl(correctSongId)
            .then((url) => {
              clearSongCoverUrl();
              songCoverUrlRef.current = url;
              setSongCoverUrl(url);
            })
            .catch((error) => {
              console.error("SONG-COVER-LOG", error);
            });
        }

        const pointsAwarded = Number(result?.result?.pointsAwarded || 0);
        if (result?.result?.correct && pointsAwarded > 0) {
          if (pointsTimerRef.current) {
            clearTimeout(pointsTimerRef.current);
          }
          if (pointsHideTimerRef.current) {
            clearTimeout(pointsHideTimerRef.current);
          }
          if (pointsCountIntervalRef.current) {
            clearInterval(pointsCountIntervalRef.current);
          }

          setPointsAnimatedValue(0);
          setPointsVisible(true);
          setPointsExiting(false);

          const totalVisibleMs = 5000;
          const exitDurationMs = 350;
          const countDurationMs = Math.max(0, totalVisibleMs - exitDurationMs - 700);
          const frameMs = 50;
          const frames = Math.max(1, Math.floor(countDurationMs / frameMs));
          let frame = 0;

          pointsCountIntervalRef.current = setInterval(() => {
            frame += 1;
            const value = Math.min(pointsAwarded, Math.round((pointsAwarded * frame) / frames));
            setPointsAnimatedValue(value);

            if (frame >= frames) {
              clearInterval(pointsCountIntervalRef.current);
              pointsCountIntervalRef.current = null;
              setPointsAnimatedValue(pointsAwarded);
            }
          }, frameMs);

          pointsTimerRef.current = setTimeout(() => {
            setPointsExiting(true);
          }, totalVisibleMs - exitDurationMs);

          pointsHideTimerRef.current = setTimeout(() => {
            setPointsVisible(false);
            setPointsExiting(false);
            setPointsAnimatedValue(0);
          }, totalVisibleMs);
        }
      })
      .catch((error) => {
        console.error("ANSWER-LOG", error);
      });
  }

  useEffect(() => {
    if (!audioRef.current) return undefined;

    const audio = audioRef.current;
    const applyVolumeWithFade = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const now = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const remaining = Math.max(0, duration - now);
      const baseVolume = Math.min(1, Math.max(0, volume / 100));

      if (remaining <= fadeOutWindowSec && duration > 0) {
        const fadeFactor = Math.max(0, remaining / fadeOutWindowSec);
        audio.volume = baseVolume * fadeFactor;
      } else {
        audio.volume = baseVolume;
      }
    };

    const onLoadedMetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDurationSec(duration);
      setCurrentSec(audio.currentTime || 0);
      setRemainingSec(Math.max(0, duration - (audio.currentTime || 0)));
      applyVolumeWithFade();
    };

    const onTimeUpdate = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const now = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      setDurationSec(duration);
      setCurrentSec(now);
      setRemainingSec(Math.max(0, duration - now));
      applyVolumeWithFade();
    };

    const onEnded = () => {
      setCurrentSec(Number.isFinite(audio.duration) ? audio.duration : 0);
      setRemainingSec(0);
      // Round is considered ended only when playback really finishes on the client.
      setRoundEnded(true);

      // Fully clear client audio buffers/state after each song.
      chunkBufferRef.current = [];
      streamMetaRef.current = { roomUniqueId: "", streamId: "", startAt: 0 };
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
      setAudioUrl("");
      setMusicStatus("waiting");
      clearSongCoverUrl();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    applyVolumeWithFade();

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl, volume]);

  useEffect(() => {
    return () => {
      if (pointsTimerRef.current) {
        clearTimeout(pointsTimerRef.current);
      }

      if (pointsCountIntervalRef.current) {
        clearInterval(pointsCountIntervalRef.current);
      }

      if (pointsHideTimerRef.current) {
        clearTimeout(pointsHideTimerRef.current);
      }

      setPointsExiting(false);
      clearSongCoverUrl();

      if (dingAudioRef.current) {
        dingAudioRef.current.pause();
      }
    };
  }, []);

  const progress = durationSec > 0 ? (Math.max(0, remainingSec) / durationSec) * 100 : 100;

  return (
    <div className={classes.container}>
      {pointsVisible ? (
        <div className={classes.pointsOverlay + " " + (pointsExiting ? classes.pointsOverlayExit : "")}>
          <div className={classes.pointsText + " " + (pointsExiting ? classes.pointsTextExit : "")}>+{pointsAnimatedValue} points</div>
        </div>
      ) : null}
      {countdownVisible ? (
        <div className={classes.countdownOverlay}>
          <div key={countdownValue} className={classes.countdownNumber}>{countdownValue}</div>
        </div>
      ) : null}
      <div className={classes.content}>
        <StyledLinearProgress variant="determinate" color="secondary" value={Number(progress)} />

        <audio ref={audioRef} src={audioUrl} preload="auto" />

        {/* <div style={{ textAlign: "center", color: "white", marginBottom: "1rem" }}>
          {musicStatus === "waiting" ? "Waiting for all players to get ready..." : "Music loaded"}
        </div> */}

        <StyledVolumeContainer>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t("VOLUME", [volume])}
          </Typography>
          <Slider
            disableSwap
            value={volume}
            min={0}
            max={100}
            onChange={(_, value) => setVolume(Number(value))}
            aria-label="Volume"
          />
        </StyledVolumeContainer>

        {/* <Typography variant="body2" sx={{ color: "white", mb: 2 }}>
          Remaining: {Math.max(0, remainingSec).toFixed(1)}s
        </Typography> */}

        <div className={classes.vinyl_container}>
          {songCoverUrl ? (
            <img src={songCoverUrl} alt="song cover" className={classes.songCover} />
          ) : null}
          <img src={"/assets/vinyls/vinyl" + generatedNumber + ".png"} alt="vinyl" className={classes.vinyl} />
        </div>

        <div className={classes.choices}>
            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === choices[0]?.id ? classes.guessed : "")}
              sx={correctChoiceId && guessed !== "0" && String(choices[0]?.id) === String(correctChoiceId)
                ? { backgroundColor: (theme) => `${theme.palette.success.light} !important`, color: (theme) => `${theme.palette.success.contrastText} !important`, boxShadow: '0 9px 0 0 rgba(102, 187, 106, 0.85) !important', '&:hover': { backgroundColor: (theme) => `${theme.palette.success.main} !important`, boxShadow: '0 0 0 0 rgba(102, 187, 106, 1) !important' } }
                : undefined}
              data-guess={choices[0]?.id || "1"}
              onClick={handleGuess}>{choices[0]?.name || "Loading..."}</StyledButtonPrimary>

            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === choices[1]?.id ? classes.guessed : "")}
              sx={correctChoiceId && guessed !== "0" && String(choices[1]?.id) === String(correctChoiceId)
                ? { backgroundColor: (theme) => `${theme.palette.success.light} !important`, color: (theme) => `${theme.palette.success.contrastText} !important`, boxShadow: '0 9px 0 0 rgba(102, 187, 106, 0.85) !important', '&:hover': { backgroundColor: (theme) => `${theme.palette.success.main} !important`, boxShadow: '0 0 0 0 rgba(102, 187, 106, 1) !important' } }
                : undefined}
              data-guess={choices[1]?.id || "2"}
              onClick={handleGuess}>{choices[1]?.name || "Loading..."}</StyledButtonPrimary>

            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === choices[2]?.id ? classes.guessed : "")}
              sx={correctChoiceId && guessed !== "0" && String(choices[2]?.id) === String(correctChoiceId)
                ? { backgroundColor: (theme) => `${theme.palette.success.light} !important`, color: (theme) => `${theme.palette.success.contrastText} !important`, boxShadow: '0 9px 0 0 rgba(102, 187, 106, 0.85) !important', '&:hover': { backgroundColor: (theme) => `${theme.palette.success.main} !important`, boxShadow: '0 0 0 0 rgba(102, 187, 106, 1) !important' } }
                : undefined}
              data-guess={choices[2]?.id || "3"}
              onClick={handleGuess}>{choices[2]?.name || "Loading..."}</StyledButtonPrimary>

            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === choices[3]?.id ? classes.guessed : "")}
              sx={correctChoiceId && guessed !== "0" && String(choices[3]?.id) === String(correctChoiceId)
                ? { backgroundColor: (theme) => `${theme.palette.success.light} !important`, color: (theme) => `${theme.palette.success.contrastText} !important`, boxShadow: '0 9px 0 0 rgba(102, 187, 106, 0.85) !important', '&:hover': { backgroundColor: (theme) => `${theme.palette.success.main} !important`, boxShadow: '0 0 0 0 rgba(102, 187, 106, 1) !important' } }
                : undefined}
              data-guess={choices[3]?.id || "4"}
              onClick={handleGuess}>{choices[3]?.name || "Loading..."}</StyledButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default Game