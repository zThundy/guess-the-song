import "./main.css";

import { useEffect, useState } from "react";

import LobbyGame from "./lobbygame/main.jsx";
import JoinGame from "./joingame/main.jsx";
import Header from "../maingameheader/main.jsx";
import PrelobbyGame from "./prelobbygame/main.jsx";

import { motion } from 'framer-motion';
import { useLocation } from "react-router-dom";

function MainGame() {
  const location = useLocation();
  const [status, setStatus] = useState("list"); // prelobby, game, create, lobby

  useEffect(() => {
    if (location.state && location.state.id && location.pathname === "/game") {
      console.log("started")
      setStatus("prelobby");
    }
  }, [location]);

  return (
    <motion.div
      className="container"
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header
        status={status}
      />
      { status === "game" ? <LobbyGame started={status} /> : null }
      { status === "list" ? <JoinGame started={status} /> : null }
      { status === "prelobby" ? <PrelobbyGame started={status} /> : null }
    </motion.div>
  )
}

export default MainGame;