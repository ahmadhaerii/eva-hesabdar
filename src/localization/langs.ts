import type { Language } from "./language";

export default [
  {
    key: "en",
    nativeName: "English",
    prefix: "EN-US",
  },
  {
    key: "fa",
    nativeName: "Farsi",
    prefix: "FA",
  },
] as const satisfies Language[];
