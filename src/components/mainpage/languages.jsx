
import { useEffect, useState } from 'react';

import style from './languages.module.css';

import { useTranslation } from "react-i18next";
import { ClickAwayListener } from '@mui/material';

const { setCookie, getCookie } = require("@helpers/cookies")
const { getAllowedLanguagesDetails } = require("@helpers/language");
const languages = getAllowedLanguagesDetails();

function List({ showList, currentLang, setLang }) {
  if (!showList) return null;

  const handleChange = (e) => {
    setLang(e.target.value);
    const currentLocation = window.location.href;
    const loc = currentLocation.split("?")[0];
    window.location.replace(loc + "?lng=" + e.target.value);
  };

  return (
    <div className={style.languageSelector}>
      {/* only show not selected languages */}
      {languages.map((item) => {
        if (item.value === currentLang) return null;
        return (
          <div
            className={style.languageItem}
            key={item.value}
            value={item.value}
            onClick={() => handleChange({ target: { value: item.value } })}
          >
            {/* <img src={`https://flagsapi.com/${item.flagCode.toUpperCase()}/flat/64.png`} alt={item.text} /> */}
            <img src={`/assets/flags/${item.flagCode.toUpperCase()}.png`} alt={item.text} />
            <span>{item.text}</span>
          </div>
        );
      })}
    </div>
  )
}

export default function Language({ }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(getCookie("i18next") || "en");
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    let lang = getCookie("i18next");
    if (!lang) {
      setCookie("i18next", "en", 365);
      lang = "en";
    }

    let params = new URLSearchParams(window.location.search);
    lang = params.get("lng");
    if (lang) {
      // check if lang is valid
      if (languages.find((item) => item.value === lang)) {
        setCookie("i18next", lang, 365);
        setLang(lang);
        i18n.changeLanguage(lang);
      } else {
        setCookie("i18next", "en", 365);
        setLang("en");
        i18n.changeLanguage("en");
      }
    }
  }, []);

  const handleChange = (lang) => {
    setShowList(false);
    setLang(lang);
    setCookie("i18next", lang, 365);
    i18n.changeLanguage(lang);
  };

  return (
    <ClickAwayListener onClickAway={() => setShowList(false)}>
      <div className={style.main}>
        <div className={`${style.currentLanguage} ${showList ? style.active : null}`} onClick={() => setShowList(!showList)}>
          <img src={`https://flagsapi.com/${languages.find((item) => item.value === lang).flagCode.toUpperCase()}/flat/64.png`} alt={languages.find((item) => item.value === lang).text} />
          <span>{languages.find((item) => item.value === lang).text}</span>
        </div>

        <List showList={showList} currentLang={lang} setLang={handleChange} />
      </div>
    </ClickAwayListener>
  )
}