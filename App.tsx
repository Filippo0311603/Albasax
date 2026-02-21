
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import AtmosphereOverlay from './components/AtmosphereOverlay';
import Hero from './sections/Hero';
import Biography from './sections/Biography';
import Tour from './sections/Tour';
import Music from './sections/Music';
import Shop from './sections/Shop';
import Press from './sections/Press';
import ArticleView from './sections/ArticleView';
import Media from './sections/Media';
import Dancers from './sections/Dancers';
import Auth from './sections/Auth';
import Verified from './sections/Verified';
import Cart from './sections/Cart';
import { User } from './types';
import { supabase } from './supabaseClient';

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

  // ── Supabase session persistence ───────────────────────────────────────
  useEffect(() => {
    // Ripristina la sessione al caricamento della pagina
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const fullName = [meta?.first_name, meta?.last_name].filter(Boolean).join(' ') || session.user.email!;
        setUser({
          email: session.user.email!,
          name: fullName,
          firstName: meta?.first_name,
          lastName: meta?.last_name,
        });
      }
    });

    // Ascolta tutti i cambiamenti di autenticazione (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const fullName = [meta?.first_name, meta?.last_name].filter(Boolean).join(' ') || session.user.email!;
        setUser({
          email: session.user.email!,
          name: fullName,
          firstName: meta?.first_name,
          lastName: meta?.last_name,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simple SEO Title updates
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.replace('/', '');
    const title = path ? `${path.charAt(0).toUpperCase() + path.slice(1)} | Albasax` : 'Albasax | Official Website';
    document.title = title;
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold-400 selection:text-black">
      <AtmosphereOverlay />
      <ScrollToTop />
      <Navbar 
        user={user} 
        cartCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <PageTransition>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/bio" element={<Biography />} />
            <Route path="/tour" element={<Tour />} />
            <Route path="/music" element={<Music />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/media" element={<Media />} />
            <Route path="/dancers" element={<Dancers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/press/:id" element={<ArticleView />} />
            <Route path="/auth" element={<Auth user={user} onLogin={setUser} onLogout={() => setUser(null)} />} />
            <Route path="/verified" element={<Verified />} />
          </Routes>
        </main>
      </PageTransition>

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
