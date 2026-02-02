
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
        <svg width="32" height="60" viewBox="0 0 32 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Griglia microfono */}
          <circle cx="16" cy="12" r="8" />
          <circle cx="16" cy="12" r="6" />
          <circle cx="16" cy="12" r="4" />
          {/* Linee griglia */}
          <line x1="8" y1="12" x2="24" y2="12" />
          <line x1="16" y1="4" x2="16" y2="20" />
          {/* Stelo */}
          <path d="M 14 20 Q 12 28 12 36 Q 12 42 14 48" strokeWidth="2" />
          <path d="M 18 20 Q 20 28 20 36 Q 20 42 18 48" strokeWidth="2" />
          {/* Base */}
          <ellipse cx="16" cy="52" rx="6" ry="3" strokeWidth="1.2" />
          <path d="M 10 52 L 10 56 Q 10 58 16 58 Q 22 58 22 56 L 22 52" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
