import classes from "./main.module.css";

import { useLocation } from "react-router-dom";
import { useState } from "react";

import { motion } from 'framer-motion';

import { useOnMountUnsafe } from "helpers/remountUnsafe";

function MainErrorPage() {
  // const error = useRouteError();
  const location = useLocation();
  const [error, setError] = useState({
    message: "Page not found",
    status: 404,
  });

  useOnMountUnsafe(() => {
    const state = location.state;
    if (state && state.error) {
      setError({
        message: state.error.message || "Page not found",
        status: state.error.status || 404,
      });
    }
  }, []);

  return (
    <motion.div
      className={classes.container}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
      exit={{ scale: 0, opacity: 1 }}
      transition={{ times: [0, 0.6, 1], duration: 0.2 }}
    >
      <h1>Error 😞</h1>
      <span className={classes.error}>{error.message}</span>
      <span className={classes.subtitle}>Status code: {error.status}</span>
    </motion.div>
  )
}

export default MainErrorPage