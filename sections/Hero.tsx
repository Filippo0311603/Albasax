
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('https://picsum.photos/seed/albasax-hero/1920/1080')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-white leading-tight">
          Albasax <br />
          <span className="block mt-4 text-xs sm:text-xl md:text-3xl font-light tracking-[0.2em] sm:tracking-[0.5em] uppercase text-gray-300">New Album Out Now</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
          Embark on a sonic journey where classical soul meets modern atmosphere. 
          Albasax's most ambitious project to date is available globally.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/music"
            className="w-full sm:w-auto px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center space-x-2 transition-all group rounded-sm"
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
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-white" />
      </div>
    </section>
  );
};

export default Hero;
