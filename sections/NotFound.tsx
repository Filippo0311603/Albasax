import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => (
  <section className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
    <p className="text-[10px] tracking-[0.4em] uppercase text-gold font-bold mb-6">Albasax</p>
    <h1 className="text-[120px] sm:text-[180px] font-serif text-white leading-none select-none opacity-10">
      404
    </h1>
    <p className="text-gray-400 text-sm uppercase tracking-[0.3em] mt-4 mb-10">
      Page not found
    </p>
    <Link
      to="/"
      className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-[10px] uppercase tracking-widest"
    >
      <ArrowLeft size={13} />
      Back to home
    </Link>
  </section>
);

export default NotFound;
