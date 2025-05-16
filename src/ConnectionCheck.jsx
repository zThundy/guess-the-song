
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "helpers/socket";
import { useOnMountUnsafe } from "helpers/remountUnsafe";

function ConnectionCheck() {

  const [stillConnected, setStillConnected] = useState(false);
  const navigate = useNavigate();

  useOnMountUnsafe(() => {
    let pingTimeout = null;
    // Socket ping to check if the user is still connected
    const pingInterval = setInterval(() => {
      if (socket)
        socket.send({
          type: "ping",
          data: { message: "pong" }
        });
    }, 5000);

    const makeTimeout = () => {
      // interval to check if the user is still connected
      return setInterval(() => {
        if (!stillConnected) {
          // handle user not connected
          navigate("/error", { state: { error: { message: "Can't enstablish connection...", code: 500 } } });
        }
      }, 60000);
    }

    socket.addListener("ping", (r) => {
      if (r.data && r.data.message === "pong") {
        if (pingTimeout) {
          clearTimeout(pingTimeout);
          pingTimeout = null;
        }

        setStillConnected((prev) => {
          if (!prev) {
            console.log("User is still connected");
            pingTimeout = makeTimeout();
            return true;
          }
          return prev;
        })
      }
    });

    return () => {
      clearInterval(pingInterval);
      clearTimeout(pingTimeout);
      if (socket)
        socket.removeListener("ping");
    }
  }, []);

  return (null);
}

export default ConnectionCheck;