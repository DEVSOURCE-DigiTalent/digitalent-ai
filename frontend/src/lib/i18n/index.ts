import { useEffect } from 'react';
import { create } from 'zustand';
import { english } from './messages';

export type UiLanguage = 'vi' | 'en';
export const LANGUAGE_STORAGE_KEY = 'digitalent-ui-language';
const foldedMessages = new Map(Object.entries(english).map(([key, value]) => [key.toLocaleLowerCase('vi'), value]));
const patterns = Object.entries(english).filter(([key]) => key.includes('{')).map(([key, value]) => ({
  expression: new RegExp('^' + key.split(/(\{\w+\})/).map(part => /^\{\w+\}$/.test(part) ? (/^\{(?:count|level|levels|page|total|shown|available|inactive|pending|submitted|graded|assignments)\}$/.test(part) ? '([0-9.,/–%\\s]+)' : '(.+?)') : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$', 'u'),
  tokens: key.match(/\{\w+\}/g) ?? [], value,
}));
function storedLanguage(): UiLanguage {
  try { return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'vi'; }
  catch { return 'vi'; }
}
export const useLanguageStore = create<{ language: UiLanguage; setLanguage: (language: UiLanguage) => void }>((set) => ({
  language: storedLanguage(),
  setLanguage: language => {
    if (language !== 'vi' && language !== 'en') return;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Still switch in this session. */ }
    set({ language });
  },
}));

/** Translate interface copy only. Never pass editable values, identifiers or API payloads here. */
export function translateUi(source: string, language?: UiLanguage): string;
export function translateUi<T>(source: T, language?: UiLanguage): T;
export function translateUi(source: unknown, language = useLanguageStore.getState().language): unknown {
  if (typeof source !== 'string' || !source || language === 'vi') return source;
  const key = source.trim().replace(/\s+/g, ' ');
  let translation = english[key] ?? foldedMessages.get(key.toLocaleLowerCase('vi'));
  if (!translation) {
    for (const pattern of patterns) {
      const match = pattern.expression.exec(key);
      if (match) { translation = pattern.value; pattern.tokens.forEach((token, index) => { translation = translation!.replace(token, token === '{domain}' ? translateUi(match[index + 1], language) : match[index + 1]); }); break; }
    }
  }
  if (!translation) return source;
  if (key === key.toLocaleUpperCase('vi') && key !== key.toLocaleLowerCase('vi')) translation = translation.toLocaleUpperCase('en');
  return source.replace(source.trim(), translation);
}

/** Subscribe inside a UI component so switching language preserves its local state. */
export function useUiLanguage() { return useLanguageStore(state => state.language); }
export function uiLocale() { return useLanguageStore.getState().language === 'en' ? 'en-GB' : 'vi-VN'; }
export function LanguageEffects() {
  const language = useUiLanguage();
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) useLanguageStore.setState({ language: event.newValue === 'en' ? 'en' : 'vi' });
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return null;
}
