import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

type TransitionEffect = 'dissolve' | 'zoom' | 'wipe' | 'push' | 'iris';

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [effect, setEffect] = useState<TransitionEffect>('dissolve');

  useEffect(() => {
    // Seleziona un effetto casuale
    const effects: TransitionEffect[] = ['dissolve', 'zoom', 'wipe', 'push', 'iris'];
    setEffect(effects[Math.floor(Math.random() * effects.length)]);
    
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Overlay di transizione */}
      <div
        className={`fixed inset-0 z-40 pointer-events-none transition-all duration-500`}
        style={{
          background: getTransitionStyle(effect, isTransitioning),
        }}
      />

      {/* Contenuto con animazione di fade */}
      <div
        className={`transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {/* Effetto wipe dall'alto */}
      {effect === 'wipe' && (
        <div
          className="fixed inset-0 z-40 pointer-events-none bg-black"
          style={{
            clipPath: isTransitioning
              ? 'polygon(0 0, 100% 0, 100% 0, 0 0)'
              : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            transition: 'clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Effetto push da sinistra */}
      {effect === 'push' && (
        <div
          className="fixed inset-0 z-40 pointer-events-none bg-gradient-to-r from-gold via-gold to-transparent"
          style={{
            transform: isTransitioning ? 'translateX(-100%)' : 'translateX(100%)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Effetto iris (cerchio che si espande) */}
      {effect === 'iris' && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, black 100%)',
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Stili CSS per le animazioni */}
      <style>{`
        @keyframes zoomOut {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(1.1);
            opacity: 0;
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes floatUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-50px);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

function getTransitionStyle(
  effect: TransitionEffect,
  isTransitioning: boolean
): string {
  if (effect === 'dissolve') {
    return isTransitioning
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(0, 0, 0, 0)';
  }
  if (effect === 'zoom') {
    return isTransitioning
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(0, 0, 0, 0)';
  }
  return 'transparent';
}

export default PageTransition;
