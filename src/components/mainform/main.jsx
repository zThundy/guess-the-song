
import classes from "./main.module.css";

import { Button, styled } from '@mui/material';
import { Launch, SportsEsports } from '@mui/icons-material';

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion'
import { useTranslation } from "react-i18next";

const StyledButtonPrimary = styled(Button)({
  background: 'linear-gradient(45deg, #ffab2b 30%, #ffc86f 90%)',
  fontWeight: 'bold',
  padding: '1rem',
  fontSize: '2rem',
  minHeight: '6rem',
  boxShadow: '0 3px 5px 2px rgba(255, 169, 41, .3)',
  transition: "all .1s ease",
  position: "relative",
  borderRadius: '1rem',
  color: "white",
  width: '100%',
  margin: '1rem 0rem 3rem 0rem',
  ":hover": {
    // rotate background gradient
    backgroundPosition: 'left',
    transition: "all .2s ease",
    boxShadow: '0 4px 8px 1px rgba(255, 169, 41, .8)',
    fontSize: '0rem',
    "& .MuiButton-endIcon": {
      transition: "all .2s ease",
      marginLeft: '0rem',
      opacity: "1",
      width: "4rem",
    },
    "& .MuiSvgIcon-root": {
      width: "4rem",
      height: "4rem",
    }
  },
  "& .MuiButton-endIcon": {
    transition: "all .2s ease",
    marginLeft: '0rem',
    opacity: "0",
    margin: "0rem 0rem 0rem 0rem",
    width: "0rem",
  },
  "& .MuiSvgIcon-root": {
    transition: "all .2s ease",
    width: ".5rem",
    height: ".5rem",
  }
});

const StyledButtonSecondary = styled(Button)({
  fontWeight: 'bold',
  padding: '.6rem 2rem',
  fontSize: '1.2rem',
  minHeight: '2rem',
});

function MainForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleJoinGame = (event) => {
    event.preventDefault();
    setTimeout(() => {
      navigate("game");
    }, 300);
  }

  const handleAccount = (event) => {
    event.preventDefault();
    setTimeout(() => {
      navigate("account");
    }, 300);
  }

  return (
    (!(location.state && location.state.shouldAnimate) ?
      <div className={`
        ${classes.form}
        ${classes.animate}
      `}>
        <h1>{t("WELCOME")} 👋</h1>
        <div className={classes.button}>
          <StyledButtonPrimary variant="contained" endIcon={<SportsEsports />} onMouseDown={handleJoinGame}>{t("PLAY")}</StyledButtonPrimary>
          <StyledButtonSecondary variant="outlined" color="secondary" endIcon={<Launch />} onMouseDown={handleAccount}>{t("ACCOUNT")}</StyledButtonSecondary>
        </div>
      </div>
      :
      <motion.div
        className={classes.form}
        initial={{ x: 3000, opacity: 1 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 3000, opacity: 1 }}
      >
        <h1>{t("WELCOME")} 👋</h1>
        <div className={classes.button}>
          <StyledButtonPrimary variant="contained" endIcon={<SportsEsports />} onMouseDown={handleJoinGame}>{t("PLAY")}</StyledButtonPrimary>
          <StyledButtonSecondary variant="outlined" color="secondary" endIcon={<Launch />} onMouseDown={handleAccount}>{t("ACCOUNT")}</StyledButtonSecondary>
        </div>
      </motion.div>
    )
  )
}

export default MainForm;