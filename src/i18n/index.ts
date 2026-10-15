import { fa } from "./fa";
import { en } from "./en";

export const LOCALES = ["fa", "en"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "fa";

type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? Widen<U>[] : { [K in keyof T]: Widen<T[K]> };
export type Dict = Widen<typeof fa>;

export const isLang = (v: string): v is Lang => (LOCALES as readonly string[]).includes(v);
export const getDict = (lang: Lang): Dict => (lang === "fa" ? fa : en);
export const dirOf = (lang: Lang) => (lang === "fa" ? "rtl" : "ltr");
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
