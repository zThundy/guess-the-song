

const languages = [
    { value: "en", text: "English", flagCode: "gb" },
    { value: "it", text: "Italiano", flagCode: "it" },
    { value: "de", text: "Deutsch", flagCode: "de" },
    { value: "fr", text: "Français", flagCode: "fr" },
    { value: "es", text: "Español", flagCode: "es" },
    { value: "pt", text: "Português", flagCode: "pt" },
    { value: "ja", text: "日本語", flagCode: "jp" },
    { value: "zh", text: "中文", flagCode: "cn" },
    { value: "sv", text: "Svenska", flagCode: "se" },
    { value: "ko", text: "한국어", flagCode: "kr" },
];

export function getAllowedLanguagesDetails() {
    return languages;
}

export function getAllowedLanguages() {
    let allowedLanguages = [];
    languages.forEach((lang) => {
        allowedLanguages.push(lang.value);
    });
    return allowedLanguages;
}