import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import CssBaseline from '@mui/material/CssBaseline';

import { getAllowedLanguages } from 'helpers/language';
// import socket from 'helpers/socket';

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


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);