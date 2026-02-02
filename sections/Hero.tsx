
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-end overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-top"
        style={{ backgroundImage: `url('/IMG_2590.webp')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-right px-6 sm:px-16 md:px-24 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full flex flex-col justify-center h-full pt-20 sm:pt-0">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-white leading-tight">
          Albasax <br />
          <span className="block mt-4 text-xs sm:text-xl md:text-3xl font-light tracking-[0.2em] sm:tracking-[0.5em] uppercase text-gray-300">I Live In A <br /> Dramatic Film</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed ml-auto">
          GLAMOUR POP ARTIST<br />
        </p>

        <div className="flex flex-col sm:flex-row items-end justify-end gap-4 pt-4 sm:pt-4 md:pt-8 mt-16 sm:mt-0">
          <Link 
            to="/music"
            className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-600 text-white flex items-center justify-center space-x-2 transition-all group rounded-sm"
          >
            <Play size={18} fill="currentColor" />
            <span className="uppercase tracking-widest text-sm font-bold">Listen Now</span>
          </Link>
          <Link 
            to="/tour"
            className="w-full sm:w-auto px-8 py-4 border border-white hover:bg-white hover:text-black text-white flex items-center justify-center space-x-2 transition-all rounded-sm"
          >
            <Calendar size={18} />
            <span className="uppercase tracking-widest text-sm font-bold">View Tour Dates</span>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="28" height="60" viewBox="0 0 28 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Capsula microfono ovale vintage */}
          <ellipse cx="14" cy="10" rx="7" ry="9" />
          {/* Dettagli rete capsula */}
          <line x1="8" y1="6" x2="20" y2="6" />
          <line x1="7" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="20" y2="14" />
          {/* Stelo sottile elegante */}
          <path d="M 13 19 L 12 45" strokeWidth="1.5" />
          {/* Supporto stelo */}
          <path d="M 11 28 Q 10 30 11 32 Q 12 30 13 32" strokeWidth="1" />
          {/* Base piede vintage */}
          <circle cx="14" cy="50" r="5" strokeWidth="1" />
          <path d="M 9 50 L 9 54 Q 9 56 14 56 Q 19 56 19 54 L 19 50" strokeWidth="1.2" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
