
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import Biography from './sections/Biography';
import Tour from './sections/Tour';
import Music from './sections/Music';
import Shop from './sections/Shop';
import Press from './sections/Press';
import ArticleView from './sections/ArticleView';
import Media from './sections/Media';

import Auth from './sections/Auth';
import Cart from './sections/Cart';
import { User } from './types';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Simple SEO Title updates
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.replace('/', '');
    const title = path ? `${path.charAt(0).toUpperCase() + path.slice(1)} | Albasax` : 'Albasax | Official Website';
    document.title = title;
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-yellow-500 selection:text-black">
      <ScrollToTop />
      <Navbar 
        user={user} 
        cartCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/bio" element={<Biography />} />
          <Route path="/tour" element={<Tour />} />
          <Route path="/music" element={<Music />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/media" element={<Media />} />
          <Route path="/press" element={<Press />} />
          <Route path="/press/:id" element={<ArticleView />} />
          <Route path="/auth" element={<Auth user={user} onLogin={setUser} onLogout={() => setUser(null)} />} />
        </Routes>
      </main>

      <Footer />
      
      {/* Dynamic Overlay Components */}
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} items={cartItems} />}
    </div>
  );
};

export default function Root() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
