
import React from 'react';

const Biography: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative animate-in fade-in slide-in-from-left-8 duration-700">
          <img 
            src="/IMG_2495.webp" 
            alt="Albasax Portrait" 
            className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
          />
          <div className="absolute -bottom-8 -right-8 w-64 h-64 border-8 border-yellow-600 -z-10 hidden md:block" />
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <header>
            <span className="text-yellow-600 tracking-[0.2em] md:tracking-[0.4em] uppercase text-xs md:text-sm font-bold">The Artist</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif mt-2">Albasax</h2>
          </header>

          <div className="space-y-6 text-gray-300 leading-relaxed text-base md:text-lg font-light">
            <p>
              Born in the heart of the jazz revival, Albasax has spent the last decade reinventing the boundaries of woodwind instruments. With a unique style that fuses neoclassical arrangements with electronic ambient layers, they have captivated audiences from intimate basement clubs in London to grand concert halls in Tokyo.
            </p>
            <p>
              Their musical journey began at the age of six, picking up a vintage tenor saxophone that would eventually become an extension of their own voice. After graduating from the prestigious Royal Academy of Music, Albasax chose to bypass the traditional paths, instead finding a new language in the intersection of organic sound and digital manipulation.
            </p>
            <p>
              "Music isn't just what you hear; it's the space between the notes," Albasax famously told Rolling Stone. This philosophy is evident in their critically acclaimed debut album 'Midnight Echoes', which topped the independent charts for six consecutive weeks.
            </p>
            <p>
              Beyond the stage, Albasax is a dedicated educator and advocate for music therapy, believing that the vibration of sound has the power to heal as much as it has to entertain.
            </p>
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
