import "./main.css";

import { useEffect, useState } from "react";

import JoinableLobby from "./lobby/main.jsx";

function Lobbies() {
  const [lobbies, setLobbies] = useState([]);

  useEffect(() => {
    const _lobbies = [];
    for (var i = 0; i < 30; i++) {
      _lobbies.push({
        name: "Unnamed Lobby " + (i + 1),
        players: Math.floor(Math.random() * 15),
        maxPlayers: Math.floor(Math.random() * 99),
        locked: Math.floor(Math.random() * 2) === 1,
        category: "Pop",
        genre: "Music"
      })
    }
    setLobbies(_lobbies);
  }, []);

  return (
    <div className="lobbiesContainer">
      {
        lobbies.map((lobby, index) => (
          <JoinableLobby
            key={index}
            name={lobby.name}
            players={lobby.players}
            maxPlayers={lobby.maxPlayers}
            locked={lobby.locked || lobby.players >= lobby.maxPlayers}
            category={lobby.category}
            genre={lobby.genre}
          />
        ))
      }
    </div>
  )
}

export default Lobbies;