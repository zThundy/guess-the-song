import MainPage from "./components/mainpage/main";

import { HashRouter } from "react-router-dom";

import { createTheme, ThemeProvider } from '@mui/material/styles';

import "./index.css";

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
  },
  typography: {
    fontFamily: [
      'Fuzzy Bubbles',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <HashRouter>
      <ThemeProvider theme={theme}>
        <MainPage />
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
