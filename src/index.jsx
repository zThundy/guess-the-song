import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import CssBaseline from '@mui/material/CssBaseline';

import { getAllowedLanguages } from 'helpers/language';

const translationModules = import.meta.glob('./language/**/*.json', { eager: true });

const resources = Object.fromEntries(
  Object.entries(translationModules).map(([filePath, module]) => {
    const fileName = filePath.split('/').pop();
    const lng = fileName ? fileName.replace(/\.json$/, '') : filePath;

    return [lng, {
      default: module.default,
    }];
  })
);

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    ns: ["default"],
    defaultNS: "default",

    resources,
    supportedLngs: getAllowedLanguages(),
  });

const onRender = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  if (actualDuration > 1) {
    if (phase === 'mount') {
      console.debug(`Component ${id} mounted in ${actualDuration}ms`);
    } else if (phase === 'update') {
      console.debug(`Component ${id} updated in ${actualDuration}ms`);
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