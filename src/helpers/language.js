

const languages = [
    { value: "en", text: "English", flagCode: "gb" },
    { value: "it", text: "Italiano", flagCode: "it" },
    // { value: "de", text: "Deutsch", flagCode: "de" },
    // { value: "fr", text: "Français", flagCode: "fr" },
    // { value: "es", text: "Español", flagCode: "es" },
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