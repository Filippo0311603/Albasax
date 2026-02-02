
import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';
import MusicNoteEffect from './MusicNoteEffect';

interface NavbarProps {
  user: UserType | null;
  cartCount: number;
  onCartClick: () => void;
}

interface NoteExplosion {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, cartCount, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [explosions, setExplosions] = useState<NoteExplosion[]>([]);
  const [explosionId, setExplosionId] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const musicSymbols = ['♪', '♫', '♩', '♬', '🎵', '🎶'];

  const createExplosion = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newExplosions: NoteExplosion[] = [];
    
    // Crea 8 note che esplodono in cerchio
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 80;
      const x = rect.left + rect.width / 2 + Math.cos(angle) * distance;
      const y = rect.top + rect.height / 2 + Math.sin(angle) * distance;
      
      newExplosions.push({
        id: explosionId + i,
        x,
        y,
        symbol: musicSymbols[Math.floor(Math.random() * musicSymbols.length)],
      });
    }
    
    setExplosions(prev => [...prev, ...newExplosions]);
    setExplosionId(prev => prev + 8);

    // Rimuovi le note dopo l'animazione
    newExplosions.forEach((note) => {
      setTimeout(() => {
        setExplosions(prev => prev.filter(n => n.id !== note.id));
      }, 800);
    });
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    createExplosion(e);
    setTimeout(() => {
      setIsMenuOpen(false);
      navigate(path);
    }, 300);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Music', path: '/music' },
    { name: 'Tour', path: '/tour' },
    { name: 'Bio', path: '/bio' },
    { name: 'Dancers', path: '/dancers' },
    { name: 'Media', path: '/media' },
    { name: 'Shop', path: '/shop' },
    { name: 'Press', path: '/press' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 glass top-0 font-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img 
              src="/logo_alb.webp" 
              alt="Albasax Logo" 
              className="h-8 w-auto"
              loading="eager"
            />
            <span className="text-xl font-serif tracking-widest uppercase font-bold text-white leading-none translate-y-[3px]">
              Albasax
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <MusicNoteEffect key={link.name}>
                <Link
                  to={link.path}
                  className={`text-sm tracking-widest uppercase transition-colors duration-200 font-navbar ${
                    isActive(link.path) ? 'text-gold' : 'text-gray-300 hover:text-gold'
                  }`}
                >
                  {link.name}
                </Link>
              </MusicNoteEffect>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link 
              to="/auth" 
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              <User size={22} />
              {user && <span className="hidden lg:inline ml-2 text-xs">{user.name}</span>}
            </Link>
            <button 
              className="md:hidden p-2 text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-gray-800 animate-in fade-in slide-in-from-top-4 duration-300 relative" ref={menuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <MusicNoteEffect key={link.name} className="block">
                <Link
                  to={link.path}
                  onClick={(e) => handleMobileNavClick(e, link.path)}
                  className={`block px-3 py-4 text-base font-medium tracking-widest uppercase font-navbar ${
                    isActive(link.path) ? 'text-gold' : 'text-gray-300 hover:text-gold'
                  }`}
                >
                  {link.name}
                </Link>
              </MusicNoteEffect>
            ))}
          </div>
          
          {/* Explosion Effects */}
          {explosions.map(note => (
            <span
              key={note.id}
              className="fixed pointer-events-none text-gold animate-float-up opacity-0"
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                fontSize: '18px',
                animation: `float-up 0.8s ease-out forwards`,
              }}
            >
              {note.symbol}
            </span>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
