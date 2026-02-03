import React from 'react';

const AtmosphereOverlay: React.FC = () => {
  return (
    <>
      {/* Grana analogica animata */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          animation: 'grain 0.8s steps(2) infinite',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Vignettatura globale sempre presente */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.15) 100%)',
          boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.3)',
        }}
      />

      {/* Effetto vignetta dorata (più evidente su hero e transizioni) */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(217, 119, 6, 0.08) 100%)',
        }}
      />

      <style>{`
        @keyframes grain {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 200px 200px;
          }
        }
      `}</style>
    </>
  );
};

export default AtmosphereOverlay;
