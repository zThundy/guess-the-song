import MainPage from "./components/mainpage/main";

import { HashRouter } from "react-router-dom";

import "./index.css";

function App() {
  return (
    <HashRouter>
      <MainPage />
    </HashRouter>
  );
}

export default App;
