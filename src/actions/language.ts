import type { i18n } from "i18next";

import { LOCAL_STORAGE_KEYS } from "@/constants";

function getDirection(lang: string): "rtl" | "ltr" {
  return lang.toLowerCase().startsWith("fa") ? "rtl" : "ltr";
}

function applyDocumentLanguage(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.dir = getDirection(lang);
}

export function setAppLanguage(lang: string, i18: i18n) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, lang);

  i18.changeLanguage(lang);

  applyDocumentLanguage(lang);
}

export function updateAppLanguage(i18: i18n) {
  const localLang = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE);

  if (!localLang) {
    // Default language
    const currentLang = i18.language || "fa";

    applyDocumentLanguage(currentLang);

    return;
  }

  i18.changeLanguage(localLang);

  applyDocumentLanguage(localLang);
}
