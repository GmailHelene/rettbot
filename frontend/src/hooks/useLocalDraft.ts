import { useEffect, useState } from 'react';

/**
 * Persister en tekstverdi til localStorage mens brukeren skriver, så teksten
 * ikke går tapt ved reload, nettverksbrudd eller at et AI-kall feiler.
 *
 * Returnerer [value, setValue, clear] – bruk som en drop-in for useState('').
 */
export function useLocalDraft(
  key: string,
  initial = ''
): [string, (v: string) => void, () => void] {
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      /* ignore – kladdelagring er ikke kritisk */
    }
  }, [key, value]);

  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue('');
  };

  return [value, setValue, clear];
}
