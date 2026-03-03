import React from 'react';
import { DANCERS } from '../constants';
import { useTranslation } from 'react-i18next';

const Dancers: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
      <header className="mb-16 text-center">
        <h2 className="text-5xl font-serif mb-4">{t('dancers.title')}</h2>
        <div className="h-1 w-20 bg-gold mx-auto" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {DANCERS.map((dancer) => (
          <div
            key={dancer.id}
            className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300"
          >
            {/* Foto */}
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={dancer.photoUrl}
                alt={`${dancer.firstName} ${dancer.lastName}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Overlay con nome */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl text-white group-hover:text-gold transition-colors tracking-wider uppercase" style={{ fontFamily: 'ClassyVogue, sans-serif' }}>
                {dancer.firstName}
              </h3>
              <p className="text-lg text-gray-300 tracking-wider uppercase">
                {dancer.lastName}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Foto di gruppo */}
      <div className="mt-16 group relative overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300">
        <div className="w-full sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <picture>
            <source media="(max-width: 767px)" srcSet="/dancers/foto-gruppo-mobile.webp" />
            <img
              src="/dancers/foto-gruppo-alb.webp"
              alt="Albasax's Dancers - Foto di gruppo"
              className="w-full h-auto sm:h-full object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </picture>
        </div>
        <div className="py-5 px-6 text-center border-t border-gray-800 bg-black/60">
          <h3 className="text-2xl font-serif text-white group-hover:text-gold transition-colors tracking-widest uppercase">
            {t('dancers.title')}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Dancers;
