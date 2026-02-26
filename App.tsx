
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
  // True while the user is in the recovery flow (clicked reset-password email link)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const navigate = useNavigate();

  // ── Single source of truth for auth state ─────────────────────────────
  // We use ONLY onAuthStateChange (Supabase v2 recommended pattern).
  // It fires on mount with the current session AND on every subsequent change.
  // This avoids the race condition with getSession() resolving after PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset-password link in their email.
        // Do NOT log them in — show the "set new password" form instead.
        setIsRecoveryMode(true);
        setUser(null);
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
              <Route path="/auth" element={
                <Auth
                  user={user}
                  onLogin={setUser}
                  onLogout={() => setUser(null)}
                  isRecoveryMode={isRecoveryMode}
                  onRecoveryComplete={() => setIsRecoveryMode(false)}
                />
              } />
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
