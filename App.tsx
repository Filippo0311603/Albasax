
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import AtmosphereOverlay from './components/AtmosphereOverlay';
import CookieBanner from './components/CookieBanner';
import { User } from './types';
import { supabase } from './supabaseClient';
import i18n from './i18n/index';

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
  // True while the user is in the recovery flow (clicked reset-password email link)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const navigate = useNavigate();

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
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '').split('/')[0];
    const pageMeta: Record<string, { title: string; description: string }> = {
      '':          { title: 'Albasax | Official Website',  description: 'Sito ufficiale di Albasax. Scopri la nuova musica, le date del tour, la biografia e contenuti esclusivi.' },
      'bio':       { title: 'Biography | Albasax',         description: 'La storia di Albasax: biografia, influenze artistiche e percorso musicale dell\'artista.' },
      'tour':      { title: 'Tour | Albasax',              description: 'Concerti e date del tour di Albasax. Trova i biglietti per il prossimo evento live vicino a te.' },
      'music':     { title: 'Music | Albasax',             description: 'Ascolta la musica di Albasax: singoli e album disponibili su Spotify, Apple Music e YouTube.' },
      'shop':      { title: 'Shop | Albasax',              description: 'Shop ufficiale di Albasax: merchandise esclusivo e prodotti in edizione limitata.' },
      'media':     { title: 'Media | Albasax',             description: 'Foto e video ufficiali di Albasax. Galleria media dell\'artista.' },
      'dancers':   { title: 'Dancers | Albasax',           description: 'I ballerini ufficiali di Albasax: storie, profili e gallery.' },
      'press':     { title: 'Press | Albasax',             description: 'Rassegna stampa e articoli su Albasax: interviste, recensioni e press kit.' },
      'auth':      { title: 'Account | Albasax',           description: 'Accedi o registrati al sito ufficiale di Albasax.' },
      'legal':     { title: 'Legal | Albasax',             description: 'Privacy Policy, Termini di Utilizzo e Cookie Policy di Albasax.' },
    };
    const meta = pageMeta[path] ?? {
      title: `${path.charAt(0).toUpperCase() + path.slice(1)} | Albasax`,
      description: 'Sito ufficiale di Albasax.',
    };

    document.title = meta.title;

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
