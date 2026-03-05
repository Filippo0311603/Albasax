import React, { useState, useEffect } from 'react';

// Sabato 7 marzo 2026 ore 14:00 CET (UTC+1)
const LAUNCH_DATE = new Date('2026-03-07T13:00:00Z');

function calcTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    done: false,
  };
}

interface Props {
  onReveal: () => void;
}

const ComingSoon: React.FC<Props> = ({ onReveal }) => {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  const [phase, setPhase]       = useState<'idle' | 'opening' | 'done'>('idle');

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleOpen = () => {
    if (!timeLeft.done || phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => {
      setPhase('done');
      onReveal();
    }, 1800);
  };

  // Pad number to 2 digits
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      {/* ── Site is rendered behind — curtain is pure overlay ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: phase === 'done' ? 'none' : 'all',
        }}
        aria-hidden={phase === 'done'}
      >
        {/* LEFT CURTAIN PANEL */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(to right, #050505 60%, #111 100%)',
            borderRight: '2px solid #c5a643',
            transition: 'transform 1.6s cubic-bezier(0.77,0,0.175,1)',
            transform: phase === 'opening' || phase === 'done' ? 'translateX(-100%)' : 'translateX(0)',
            willChange: 'transform',
          }}
        >
          {/* Vertical gold trim lines */}
          <div style={{ position: 'absolute', right: 12, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, #c5a64355, #c5a643, #c5a64355, transparent)' }} />
          <div style={{ position: 'absolute', right: 18, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, #c5a64322, transparent)' }} />
        </div>

        {/* RIGHT CURTAIN PANEL */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(to left, #050505 60%, #111 100%)',
            borderLeft: '2px solid #c5a643',
            transition: 'transform 1.6s cubic-bezier(0.77,0,0.175,1)',
            transform: phase === 'opening' || phase === 'done' ? 'translateX(100%)' : 'translateX(0)',
            willChange: 'transform',
          }}
        >
          <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, #c5a64355, #c5a643, #c5a64355, transparent)' }} />
          <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, #c5a64322, transparent)' }} />
        </div>

        {/* CENTER CONTENT — stays in place while curtains slide away */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.4s',
            opacity: phase === 'opening' ? 0 : 1,
          }}
        >
          {/* Gold line top */}
          <div style={{ width: 320, maxWidth: '80vw', height: 2, background: 'linear-gradient(90deg,transparent,#c5a643,transparent)', marginBottom: 32 }} />

          {/* Logo / brand */}
          <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#c5a643', fontWeight: 700, pointerEvents: 'none' }}>
            — ALBASAX —
          </p>
          <p style={{ margin: '0 0 40px', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4b4b4b', pointerEvents: 'none' }}>
            Dramatic Pop
          </p>

          {/* Headline */}
          <p style={{ margin: '0 0 8px', fontFamily: "Georgia,'Times New Roman',serif", fontSize: 'clamp(22px,4vw,38px)', fontWeight: 400, color: '#ffffff', letterSpacing: '0.02em', textAlign: 'center', padding: '0 24px', lineHeight: 1.3, pointerEvents: 'none' }}>
            Il sipario sta per alzarsi.
          </p>
          <p style={{ margin: '0 0 48px', fontSize: 13, color: '#6b6b6b', letterSpacing: '0.1em', textAlign: 'center', padding: '0 32px', lineHeight: 1.7, pointerEvents: 'none' }}>
            Sabato 7 Marzo 2026 · ore 14:00
          </p>

          {/* Countdown */}
          {!timeLeft.done ? (
            <div style={{ display: 'flex', gap: 'clamp(16px,4vw,40px)', marginBottom: 52, pointerEvents: 'none' }}>
              {[
                { value: timeLeft.days,    label: 'GIORNI' },
                { value: timeLeft.hours,   label: 'ORE' },
                { value: timeLeft.minutes, label: 'MINUTI' },
                { value: timeLeft.seconds, label: 'SECONDI' },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'center', minWidth: 'clamp(52px,10vw,80px)' }}>
                  <div style={{
                    fontFamily: "Georgia,'Times New Roman',serif",
                    fontSize: 'clamp(32px,6vw,58px)',
                    fontWeight: 400,
                    color: '#ffffff',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(180deg,#ffffff,#9ca3af)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {pad(value)}
                  </div>
                  <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#4b4b4b', marginTop: 8 }}>{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: '0 0 40px', fontSize: 14, color: '#c5a643', letterSpacing: '0.2em', textTransform: 'uppercase', pointerEvents: 'none' }}>
              ✦ Il momento è arrivato ✦
            </p>
          )}

          {/* Button */}
          <button
            onClick={handleOpen}
            disabled={!timeLeft.done}
            style={{
              pointerEvents: timeLeft.done ? 'all' : 'none',
              cursor: timeLeft.done ? 'pointer' : 'default',
              padding: '18px 48px',
              border: `1px solid ${timeLeft.done ? '#c5a643' : '#2a2a2a'}`,
              background: 'transparent',
              color: timeLeft.done ? '#c5a643' : '#2a2a2a',
              fontSize: 10,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              fontWeight: 700,
              fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
              transition: 'all 0.3s',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: timeLeft.done ? '0 0 24px #c5a64333' : 'none',
            }}
            onMouseEnter={e => {
              if (!timeLeft.done) return;
              (e.currentTarget as HTMLButtonElement).style.background = '#c5a643';
              (e.currentTarget as HTMLButtonElement).style.color = '#000';
            }}
            onMouseLeave={e => {
              if (!timeLeft.done) return;
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#c5a643';
            }}
          >
            Alza il Sipario
          </button>

          {/* Gold line bottom */}
          <div style={{ width: 320, maxWidth: '80vw', height: 2, background: 'linear-gradient(90deg,transparent,#c5a643,transparent)', marginTop: 40 }} />

          {!timeLeft.done && (
            <p style={{ marginTop: 20, fontSize: 9, color: '#2a2a2a', letterSpacing: '0.2em', pointerEvents: 'none' }}>
              IL BOTTONE SI ATTIVERÀ ALLO SCOCCARE DEL COUNTDOWN
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ComingSoon;
