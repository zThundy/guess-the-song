import "./main.css";

import { useRouteError } from "react-router-dom";

import { motion } from 'framer-motion';

function MainErrorPage() {
  // const error = useRouteError();

  return (
    <motion.div
      className="errorContainer"
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
      exit={{ scale: 0, opacity: 1 }}
      transition={{ times: [0, 0.6, 1], duration: 0.2 }}
    >
      <h1>Error 😞</h1>
      <p>Page not found</p>
    </motion.div>
  )
}

export default MainErrorPage