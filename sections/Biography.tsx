import React from 'react';
import { useTranslation } from 'react-i18next';

const Biography: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative animate-in fade-in slide-in-from-left-8 duration-700">
          <img 
            src="/IMG_2492.webp" 
            alt="Albasax Portrait" 
            className="w-full h-auto grayscale hover:grayscale-0 active:grayscale-0 transition-all duration-1000 shadow-2xl"
          />
          <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-32 h-32 md:w-64 md:h-64 border-4 md:border-8 border-gold -z-10" />
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <header>
            <span className="text-gold tracking-[0.2em] md:tracking-[0.4em] uppercase text-xs md:text-sm font-bold">{t('bio.sectionLabel')}</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif mt-2">Albasax</h2>
          </header>

          <div className="space-y-6 text-gray-300 leading-relaxed text-base md:text-lg font-light">
            <p>{t('bio.p1')}</p>
            <p>{t('bio.p2')}</p>
            <p>{t('bio.p3')}</p>
            <p>{t('bio.p4')}</p>
          </div>

          <div className="pt-4">
             {/* Signature removed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Biography;