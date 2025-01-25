import classes from "./main.module.css";

import { useEffect, useState } from "react";

import { Button, Grid, LinearProgress, styled } from "@mui/material";

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 4,
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

const StyledButtonPrimary = styled(Button)({
  fontWeight: 'bold',
  fontSize: '1rem',
  boxShadow: '0 9px 0 0 rgba(190,100,0, .8)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  bottom: '9px',
  ":hover": {
    background: "rgb(255, 123, 0)",
    transition: "all .2s ease",
    boxShadow: '0 0 0 0 rgba(190, 100, 0, 1)',
    bottom: '0px',
  },
});

function Game() {
  // TODO: logic from server (?) to determine time for answer
  const [maxSeconds] = useState(10);

  const [guessed, setGuessed] = useState("0");
  const [msLeft, setMsLeft] = useState(maxSeconds * 1000);
  const [started, setStarted] = useState(false);
  const [generatedNumber] = useState((Math.floor(Math.random() * 15) + 1));

  const handleGuess = (e) => {
    if (guessed !== "0") return;
    const guess = e.currentTarget.dataset.guess;
    setGuessed(guess);
    setStarted(true);
  }

  useEffect(() => {
    if (!started) return;
    const step = 10;
    const interval = setInterval(() => {
      setMsLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - step;
      });
    }, step);
    return () => clearInterval(interval);
  }, [started]);

  const progress = (msLeft / (maxSeconds * 1000)) * 100;

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <StyledLinearProgress variant="determinate" color="secondary" value={Number(progress)} />

        <div className={classes.vinyl_container}>
          <img src={"/public/assets/vinyls/vinyl" + generatedNumber + ".png"} alt="vinyl" className={classes.vinyl} />
        </div>

        <Grid container className={classes.choices}>
          <Grid item xs={12}>
            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === "1" ? classes.guessed : "")}
              data-guess="1"
              onClick={handleGuess}>Justin beaber</StyledButtonPrimary>
          </Grid>
          <Grid item xs={12}>
            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === "2" ? classes.guessed : "")}
              data-guess="2"
              onClick={handleGuess}>Maroon 5</StyledButtonPrimary>
            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === "3" ? classes.guessed : "")}
              data-guess="3"
              onClick={handleGuess}>Ed Sheeran</StyledButtonPrimary>
          </Grid>
          <Grid item xs={12}>
            <StyledButtonPrimary
              variant="contained"
              className={classes.button + " " + (guessed === "4" ? classes.guessed : "")}
              data-guess="4"
              onClick={handleGuess}>Alan Walker</StyledButtonPrimary>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Game