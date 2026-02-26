
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import AtmosphereOverlay from './components/AtmosphereOverlay';
import { User } from './types';
import { supabase } from './supabaseClient';

const Hero        = lazy(() => import('./sections/Hero'));
const Biography   = lazy(() => import('./sections/Biography'));
const Tour        = lazy(() => import('./sections/Tour'));
const Music       = lazy(() => import('./sections/Music'));
const Shop        = lazy(() => import('./sections/Shop'));
const Press       = lazy(() => import('./sections/Press'));
const ArticleView = lazy(() => import('./sections/ArticleView'));
const Media       = lazy(() => import('./sections/Media'));
const Dancers     = lazy(() => import('./sections/Dancers'));
const Auth        = lazy(() => import('./sections/Auth'));
const Verified    = lazy(() => import('./sections/Verified'));
const Legal       = lazy(() => import('./sections/Legal'));
const Unsubscribe     = lazy(() => import('./sections/Unsubscribe'));
const AdminNewsletter = lazy(() => import('./sections/AdminNewsletter'));
const Cart            = lazy(() => import('./sections/Cart'));

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

  const navigate = useNavigate();

  // ── Redirect to /auth when Supabase appends #type=recovery to the Site URL ──
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      sessionStorage.setItem('pw_recovery', '1');
      navigate('/auth', { replace: true });
    }
  }, []);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Quando l'utente clicca il link di reset password, NON fare login automatico
      // ma reindirizza ad /auth dove mostreremo il form "Nuova Password"
      if (event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem('pw_recovery', '1');
        navigate('/auth', { replace: true });
        return;
      }
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

  // SEO Title updates — pathname reflects real URL with BrowserRouter
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '').split('/')[0];
    const pageNames: Record<string, string> = {
      '':         'Albasax | Official Website',
      'bio':      'Biography | Albasax',
      'tour':     'Tour | Albasax',
      'music':    'Music | Albasax',
      'shop':     'Shop | Albasax',
      'media':    'Media | Albasax',
      'dancers':  'Dancers | Albasax',
      'press':    'Press | Albasax',
      'auth':     'Account | Albasax',
      'verified': 'Email Verified | Albasax',
      'legal':       'Legal | Albasax',
      'unsubscribe':  'Unsubscribe | Albasax',
    };
    document.title = pageNames[path] ?? `${path.charAt(0).toUpperCase() + path.slice(1)} | Albasax`;
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
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
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
              <Route path="/legal/:type" element={<Legal />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            </Routes>
          </Suspense>
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
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
