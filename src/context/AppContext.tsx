import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Lang } from '../lib/translations';
import { t as _t, tf as _tf, type TKey } from '../lib/translations';

interface AppCtx {
  lang:       Lang;
  toggleLang: () => void;
  t:  (key: TKey) => string;
  tf: (key: TKey, vars: Record<string, string | number>) => string;
}

const Ctx = createContext<AppCtx>({
  lang: 'en', toggleLang: () => {},
  t: k => _t(k, 'en'), tf: (k, v) => _tf(k, 'en', v),
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = useCallback(() =>
    setLang(l => { const n = l === 'en' ? 'hi' : 'en'; document.documentElement.lang = n; return n; }), []);
  const t  = useCallback((k: TKey) => _t(k, lang), [lang]);
  const tf = useCallback((k: TKey, v: Record<string, string | number>) => _tf(k, lang, v), [lang]);
  return <Ctx.Provider value={{ lang, toggleLang, t, tf }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
