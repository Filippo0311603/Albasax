import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language.slice(0, 2)) ?? LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors select-none"
        aria-label="Select language"
      >
        <img
          src={`https://flagcdn.com/w20/${current.flagCode}.png`}
          width={20}
          height={15}
          alt={current.label}
          className="rounded-sm object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-black border border-gray-800 shadow-2xl z-[200] py-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => select(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-widest transition-colors text-left
                ${lang.code === current.code ? 'text-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <img
                src={`https://flagcdn.com/w20/${lang.flagCode}.png`}
                width={20}
                height={15}
                alt={lang.label}
                className="rounded-sm object-cover"
              />
              <span style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
