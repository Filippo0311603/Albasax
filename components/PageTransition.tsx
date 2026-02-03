import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionCount, setTransitionCount] = useState(0);
  const [fromDirection, setFromDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    // Alterna direzione: destra, sinistra, destra, sinistra...
    const direction = transitionCount % 2 === 0 ? 'right' : 'left';
    setFromDirection(direction);
    
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    setTransitionCount(prev => prev + 1);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Contenuto con animazione di fade */}
      <div
        className={`transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {/* Effetto push dorato da destra o sinistra */}
      <div
        className="fixed inset-0 z-40 pointer-events-none bg-gradient-to-r from-gold via-gold to-transparent"
        style={{
          transform: isTransitioning 
            ? fromDirection === 'right' 
              ? 'translateX(-100%)' 
              : 'translateX(100%)'
            : fromDirection === 'right'
            ? 'translateX(100%)'
            : 'translateX(-100%)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Vignettatura potenziata durante transizioni */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)',
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.5)',
          opacity: isTransitioning ? 0.6 : 0,
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Stili CSS per le animazioni */}
      <style>{`
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

export default PageTransition;
