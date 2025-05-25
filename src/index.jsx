import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import CssBaseline from '@mui/material/CssBaseline';

import { getAllowedLanguages } from 'helpers/language';
import socket from 'helpers/socket';

const apiKey = "Gkfk5_77WBzwXWEjxu-J3Q";
const loadPath = `https://api.i18nexus.com/project_resources/translations/{{lng}}/{{ns}}.json?api_key=${apiKey}`;

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    ns: ["default"],
    defaultNS: "default",

    supportedLngs: getAllowedLanguages(),
    backend: {
      loadPath: loadPath,
    },
  });

const onRender = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  if (actualDuration > 1) {
    if (phase === 'mount') {
      console.log(`Component ${id} mounted in ${actualDuration}ms`);
    } else if (phase === 'update') {
      console.log(`Component ${id} updated in ${actualDuration}ms`);
    }
  }
}


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <React.Profiler id="App" onRender={onRender}>
      <React.Profiler id="ConnectionCheck" onRender={onRender}>
        <React.Profiler id="Notifications" onRender={onRender}>
          <CssBaseline />
          <App />
        </React.Profiler>
      </React.Profiler>
    </React.Profiler>
  </React.StrictMode>
);