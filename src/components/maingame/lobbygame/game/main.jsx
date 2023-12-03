import "./main.css";

import { useEffect, useState } from "react";

import { Button, Grid, LinearProgress, styled } from "@mui/material";

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  width: "90%",
  margin: "0 auto 2rem auto",
  backgroundColor: "white",
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

function Game() {
  const [guessed, setGuessed] = useState("0");
  const [maxSeconds] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(maxSeconds - 3);
  const [started, setStarted] = useState(false);

  const handleGuess = (e) => {
    if (guessed !== "0") return;
    const guess = e.currentTarget.dataset.guess;
    setGuessed(guess);
    setStarted(true);
  }

  useEffect(() => {
    console.log("started", started);
    var msLeft = secondsLeft * 1000;
    const step = 10;
    const interval = setInterval(() => {
      if (!started) return;
      console.log("msLeft", msLeft)
      if (msLeft <= 0) {
        clearInterval(interval);
        return;
      }
      msLeft -= step;
      const _secondsLeft = (msLeft / 1000);
      setSecondsLeft(_secondsLeft);
    }, step);
    return () => clearInterval(interval);
  }, [secondsLeft, started]);

  // calculate progress from secondsLeft
  const progress = (secondsLeft / (maxSeconds - 3)) * 100;

  return (
    <div className="gameContentContainer">
      <div className="gameContent">
        <StyledLinearProgress variant="determinate" color="secondary" value={Number(progress)} />

        <img src="/assets/vinyl.png" alt="vinyl" className="vinyl" />

        <Grid container className="choicesContainer">
          <Grid item xs={12}>
            <Button
              variant="contained"
              className={"choiceButton " + (guessed === "1" ? "guessed" : "")}
              data-guess="1"
              onClick={handleGuess}>a</Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              className={"choiceButton " + (guessed === "2" ? "guessed" : "")}
              data-guess="2"
              onClick={handleGuess}>b</Button>
            <Button
              variant="contained"
              className={"choiceButton " + (guessed === "3" ? "guessed" : "")}
              data-guess="3"
              onClick={handleGuess}>c</Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              className={"choiceButton " + (guessed === "4" ? "guessed" : "")}
              data-guess="4"
              onClick={handleGuess}>f</Button>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Game