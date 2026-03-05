
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import AtmosphereOverlay from './components/AtmosphereOverlay';
import CookieBanner from './components/CookieBanner';
import ComingSoon from './components/ComingSoon';
import { User } from './types';
import { supabase } from './supabaseClient';
import i18n from './i18n/index';

// TEST: 2 minuti da quando il bundle viene caricato
const LAUNCH_DATE = new Date(Date.now() + 2 * 60 * 1000);

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
const Unsubscribe         = lazy(() => import('./sections/Unsubscribe'));
const AdminNewsletter     = lazy(() => import('./sections/AdminNewsletter'));
const Admin               = lazy(() => import('./sections/Admin'));
const NewsletterConfirm   = lazy(() => import('./sections/NewsletterConfirm'));
const Cart                = lazy(() => import('./sections/Cart'));
const NotFound            = lazy(() => import('./sections/NotFound'));

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
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ── Coming Soon guard ─────────────────────────────────────────────────
  // Admin bypass: path /admin/* OPPURE ?backstage=albasax2026
  const isAdminBypass =
    location.pathname.startsWith('/admin') ||
    new URLSearchParams(location.search).get('backstage') === 'albasax2026';

  const [revealed, setRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (Date.now() >= LAUNCH_DATE.getTime()) return true;       // già scaduto
    return localStorage.getItem('albasax_sipario') === 'true';  // già aperto da questo browser
  });

  const handleReveal = () => {
    localStorage.setItem('albasax_sipario', 'true');
    setRevealed(true);
  };

  const showCurtain = !isAdminBypass && !revealed;

  // ── Single source of truth for auth state ─────────────────────────────
  // sessionStorage.supabase_auth_type is set by the inline <script> in index.html
  // BEFORE the Supabase SDK loads and clears the URL hash. This is the only
  // reliable way to know which type of auth link the user clicked.
  useEffect(() => {
    const authType = sessionStorage.getItem('supabase_auth_type');
    // Consume immediately so it doesn't persist across normal navigations
    if (authType) sessionStorage.removeItem('supabase_auth_type');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setUser(null);
        navigate('/auth', { replace: true });
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        const meta = session.user.user_metadata;
        const fullName = [meta?.first_name, meta?.last_name].filter(Boolean).join(' ') || session.user.email!;
        setUser({
          email: session.user.email!,
          name: fullName,
          firstName: meta?.first_name,
          lastName: meta?.last_name,
        });
        // If the user arrived via an email verification link, send them to /verified
        if (event === 'SIGNED_IN' && authType === 'signup') {
          navigate('/verified', { replace: true });
        }
        return;
      }

      if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // SEO Title + Description + Canonical — updated per route
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '').split('/')[0];
    const pageMeta: Record<string, { title: string; description: string }> = {
      '':          { title: 'Albasax | Official Website',  description: 'Official website of Albasax. Discover new music, tour dates, biography and exclusive content.' },
      'bio':       { title: 'Biography | Albasax',         description: 'The story of Albasax: biography, artistic influences and musical journey.' },
      'tour':      { title: 'Tour | Albasax',              description: 'Albasax tour dates and live events. Find tickets for the next show near you.' },
      'music':     { title: 'Music | Albasax',             description: 'Listen to Albasax\'s music: singles and albums on Spotify, Apple Music and YouTube.' },
      'shop':      { title: 'Shop | Albasax',              description: 'Official Albasax shop: exclusive merchandise and limited edition products.' },
      'media':     { title: 'Media | Albasax',             description: 'Official Albasax photos and videos. Artist media gallery.' },
      'dancers':   { title: 'Dancers | Albasax',           description: 'The official Albasax dancers: stories, profiles and gallery.' },
      'press':     { title: 'Press | Albasax',             description: 'Press coverage and articles about Albasax: interviews, reviews and press kit.' },
      'auth':      { title: 'Account | Albasax',           description: 'Sign in or create your Albasax account.' },
      'legal':     { title: 'Legal | Albasax',             description: 'Privacy Policy, Terms of Use and Cookie Policy of Albasax.' },
    };
    const meta = pageMeta[path] ?? {
      title: `${path.charAt(0).toUpperCase() + path.slice(1)} | Albasax`,
      description: 'Official website of Albasax.',
    };

    document.title = meta.title;

    // Robots: noindex for private/utility pages
    const PRIVATE_PATHS = ['auth', 'verified', 'admin', 'unsubscribe', 'newsletter'];
    const isPrivate = PRIVATE_PATHS.some(p => path === p || location.pathname.startsWith(`/${p}`));
    let robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
    }
    robotsEl.content = isPrivate ? 'noindex,nofollow' : 'index,follow';

    // Meta description
    const descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descEl) descEl.content = meta.description;

    // Canonical
    const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.href = `https://albasax.com${location.pathname}`;

    // OG title + description
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = meta.title;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = meta.description;
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = `https://albasax.com${location.pathname}`;
  }, [location]);

  // html lang — updated when i18n language changes
  useEffect(() => {
    const updateLang = (lng: string) => { document.documentElement.lang = lng; };
    updateLang(i18n.language);
    i18n.on('languageChanged', updateLang);
    return () => i18n.off('languageChanged', updateLang);
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold-400 selection:text-black">
      <AtmosphereOverlay />
      <ScrollToTop />

      {/* Coming Soon curtain — overlay sopra tutto, trasparente dopo reveal */}
      {showCurtain && <ComingSoon onReveal={handleReveal} />}

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
              <Route path="/newsletter/confirm" element={<NewsletterConfirm />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </PageTransition>

      <Footer />
      
      {/* Dynamic Overlay Components */}
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} items={cartItems} />}
      <CookieBanner />
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
