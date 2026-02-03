
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-end overflow-hidden">
      {/* Vignettatura Hero più evidente */}
      <div 
        className="absolute inset-0 z-5 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.6)',
        }}
      />

      {/* Spotlight morbido sul volto (ellisse diffusa) */}
      <div 
        className="absolute inset-0 z-4 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 700px at 40% 35%, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0.05) 40%, transparent 100%)',
        }}
      />

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-top"
        style={{ 
          backgroundImage: `url('/IMG_2590.webp')`,
          animation: 'breathe 6s ease-in-out infinite',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-right px-6 sm:px-16 md:px-24 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full flex flex-col justify-center h-full pt-20 sm:pt-0">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-white leading-tight ml-auto">
          Albasax
        </h1>
        
        <div className="space-y-0">
          <span className="block text-xs sm:text-xl md:text-3xl font-serif font-light tracking-[0.2em] sm:tracking-[0.5em] uppercase text-gray-300 whitespace-nowrap">
            I Live In A
          </span>
          <span className="block text-xs sm:text-xl md:text-3xl font-serif font-light tracking-[0.2em] sm:tracking-[0.5em] uppercase text-gray-300 whitespace-nowrap">
            Dramatic Film
          </span>
        </div>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed ml-auto">
          GLAMOUR POP ARTIST<br />
        </p>

        <div className="flex flex-col sm:flex-row items-end justify-end gap-3 sm:gap-4 pt-4 sm:pt-4 md:pt-8 mt-16 sm:mt-0">
          <Link 
            to="/music"
            className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gold-animated text-white flex items-center justify-center space-x-2 transition-all group rounded-sm shadow-lg hover:shadow-xl"
          >
            <Play size={18} fill="currentColor" />
            <span className="uppercase tracking-widest text-sm font-bold">Listen Now</span>
          </Link>
          <Link 
            to="/tour"
            className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 border border-white hover:bg-white hover:text-black text-white flex items-center justify-center space-x-2 transition-all rounded-sm"
          >
            <Calendar size={18} />
            <span className="uppercase tracking-widest text-sm font-bold">View Tour Dates</span>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 inset-x-0 flex justify-center animate-bounce">
        <img 
          src="/sax.svg" 
          alt="Scroll indicator saxophone" 
          className="h-12 w-auto filter brightness-0 invert"
        />
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.015);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
