import MainPage from "components/Routes/main";
import Notifications from "components/Notifications/main";
import ConnectionCheck from "./ConnectionCheck";

import { BrowserRouter, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import "./index.css";

import { setCookie } from "helpers/cookies";
import api from "helpers/api";
import { useOnMountUnsafe } from "helpers/remountUnsafe";
import { useEventEmitter } from "helpers/eventEmitter";

const theme = createTheme({
  status: {
    danger: "rgb(255, 174, 94)",
  },
  palette: {
    primary: {
      main: "rgb(255, 174, 94)",
    },
    secondary: {
      main: "rgb(204,102,0)",
    },
    error: {
      main: "rgb(255, 0, 0)",
    }
  },
  typography: {
    fontFamily: [
      'Fuzzy Bubbles',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const eventEmitter = useEventEmitter()

  useOnMountUnsafe(() => {
    api.userAction()
      .then(user => {
        if (!user) return console.error("User not found");

        setCookie("username", user.username, 365);
        setCookie("uniqueId", user.uniqueId, 365);
        setCookie("userImage", user.userImage, 365);
        setCookie("created", user.created, 365);
        setCookie("last_login", user.last_login, 365);
        setCookie("points", user.points, 365);
        setCookie("level", user.level, 365);
        setCookie("currentRoom", user.currentRoom, 365);
      })
      .catch(error => {
        eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"))
        console.log(error);
      });

    return () => {
    }
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Notifications />
        <ConnectionCheck />
        <MainPage />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
