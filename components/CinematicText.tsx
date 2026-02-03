import React, { useEffect, useState } from 'react';

interface CinematicTextProps {
  children: string;
  className?: string;
  letterDelay?: number; // millisecondi tra una lettera e l'altra
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

const CinematicText: React.FC<CinematicTextProps> = ({ 
  children, 
  className = '', 
  letterDelay = 80,
  as: Component = 'h1'
}) => {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (visibleLetters < children.length) {
      const timer = setTimeout(() => {
        setVisibleLetters(prev => prev + 1);
      }, letterDelay);
      return () => clearTimeout(timer);
    }
  }, [visibleLetters, children.length, letterDelay]);

  const letters = children.split('');

  return (
    <Component
      className={`${className} inline-block`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        letterSpacing: isHovering ? '0.15em' : '0.05em',
        transition: 'letter-spacing 0.3s ease-out',
      }}
    >
      {letters.map((letter, idx) => (
        <span
          key={idx}
          style={{
            display: 'inline-block',
            opacity: idx < visibleLetters ? 1 : 0,
            transform: idx < visibleLetters 
              ? 'translateY(0) rotateX(0deg)' 
              : 'translateY(10px) rotateX(90deg)',
            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05}s`,
            willChange: 'transform, opacity',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </Component>
  );
};

export default CinematicText;
