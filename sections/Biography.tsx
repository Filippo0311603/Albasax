
import React from 'react';

const Biography: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative animate-in fade-in slide-in-from-left-8 duration-700">
          <img 
            src="/IMG_2492.webp" 
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
              ALBASAX is an international Pop Artist, Performer, Singer and Saxophonist, blending what he loves to define as his “Cinematic Glamour Pop” with live instruments and dramatic performance into a single artistic universe. Graduated from the prestigious Santa Cecilia Conservatory of Rome, he combines a solid musical foundation with contemporary pop, electronic soundscapes and theatrical storytelling.
            </p>
            <p>
              His artistic world is inspired by Hollywood cinema, theatrical aesthetics and pop spectacle, shaping a distinctive identity where elegance, glamour, vulnerability and power coexist.
            </p>
            <p>
              Driven by the belief that music is not only meant to be heard, but also seen, felt and lived, ALBASAX transforms each performance into a cinematic experience — where music becomes a film and the stage becomes a scene.
            </p>
            <p>
              He is currently working on his international debut album, written in English and Spanish, conceived as a cinematic journey designed for a global audience, where sound, image and performance merge into one immersive vision.
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
