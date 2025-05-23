
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "helpers/socket";
import { useOnMountUnsafe } from "helpers/remountUnsafe";
import { setCookie, getCookie } from 'helpers/cookies'

function ConnectionCheck() {
  const [stillConnected, setStillConnected] = useState(false);
  const navigate = useNavigate();

  useOnMountUnsafe(() => {
    let pingTimeout = null;
    // Socket ping to check if the user is still connected
    const pingInterval = setInterval(() => {
      if (socket) {
        let user = getCookie('uniqueId');
        let userImage = getCookie('userImage');
        let username = getCookie('username');
        if (user) {
          socket.send({
            type: "ping",
            data: { user, username, userImage }
          });
        } else {
          console.log("User not connected");
        }
      }
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

    socket.addListener("pong", (r) => {
      if (r.data) {
        const serverTime = new Date(r.data.time);
        const clientTime = new Date();
        const timeDiff = Math.abs(serverTime - clientTime);
        const diffInSeconds = Math.floor(timeDiff / 1000);
        console.log("Time difference: ", diffInSeconds, " seconds");

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
        socket.removeListener("pong");
    }
  }, []);

  return (null);
}

export default ConnectionCheck;