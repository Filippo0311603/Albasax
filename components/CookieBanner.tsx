import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface ConsentState {
  analytics: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'albasax_cookie_consent';

function applyConsent(analytics: boolean) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
    });
  }
}

function saveConsent(analytics: boolean) {
  const payload: ConsentState = { analytics, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  applyConsent(analytics);
}

function loadConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: ConsentState = JSON.parse(raw);
    // Re-ask after 12 months
    if (Date.now() - parsed.timestamp > 365 * 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = loadConsent();
    if (!consent) {
      // Small delay so page renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Listen for "open cookie settings" event dispatched from Footer
  useEffect(() => {
    const handler = () => {
      const consent = loadConsent();
      setAnalyticsChecked(consent?.analytics ?? false);
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener('albasax:open-cookie-settings', handler);
    return () => window.removeEventListener('albasax:open-cookie-settings', handler);
  }, []);

  const acceptAll = () => {
    saveConsent(true);
    setVisible(false);
  };

  const rejectAll = () => {
    saveConsent(false);
    setVisible(false);
  };

  const savePreferences = () => {
    saveConsent(analyticsChecked);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] border border-gray-800 shadow-2xl">
        {/* Top gold line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="p-6 md:p-8">
          {!showPrefs ? (
            /* ── Main banner ── */
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] tracking-[0.35em] uppercase text-gold font-bold">Cookie Policy</p>
                  <h3 className="text-base font-serif text-white">We use cookies</h3>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                We use cookies to ensure the proper functioning of the website and, with your consent, to analyze traffic and improve performance via Google Analytics.
                You can accept all cookies, reject non-essential cookies, or manage your preferences.{' '}
                <Link to="/legal/cookies" className="text-gold hover:underline" onClick={() => setVisible(false)}>
                  Learn more in our Cookie Policy
                </Link>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-gold text-black text-[11px] tracking-[0.25em] uppercase font-bold py-3 px-6 hover:bg-gold/90 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={rejectAll}
                  className="flex-1 border border-gray-700 text-gray-300 text-[11px] tracking-[0.25em] uppercase py-3 px-6 hover:border-gray-400 hover:text-white transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => { setAnalyticsChecked(loadConsent()?.analytics ?? false); setShowPrefs(true); }}
                  className="flex-1 border border-gray-800 text-gray-500 text-[11px] tracking-[0.25em] uppercase py-3 px-6 hover:border-gray-600 hover:text-gray-300 transition-colors"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          ) : (
            /* ── Preferences panel ── */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-gold font-bold">Cookie Preferences</p>
                  <h3 className="text-base font-serif text-white mt-1">Manage your preferences</h3>
                </div>
                <button onClick={() => setShowPrefs(false)} className="text-gray-600 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Essential - always on */}
              <div className="border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white tracking-wider font-semibold">Essential Cookies</p>
                    <p className="text-xs text-gray-500 mt-0.5">Always Active</p>
                  </div>
                  <div className="w-10 h-5 bg-gold rounded-full flex items-center justify-end pr-0.5 cursor-not-allowed opacity-60">
                    <div className="w-4 h-4 bg-black rounded-full" />
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(v => !v)}
                  className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
                >
                  {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showDetails ? 'Hide details' : 'Show details'}
                </button>
                {showDetails && (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Necessary for login, security, and core functionality (authentication sessions, security tokens). Cannot be disabled.
                  </p>
                )}
              </div>

              {/* Analytics - optional */}
              <div className="border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white tracking-wider font-semibold">Analytics Cookies</p>
                    <p className="text-xs text-gray-500 mt-0.5">Optional — Google Analytics</p>
                  </div>
                  <button
                    onClick={() => setAnalyticsChecked(v => !v)}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors duration-200 ${analyticsChecked ? 'bg-gold justify-end pr-0.5' : 'bg-gray-700 justify-start pl-0.5'}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Used to understand website usage (pages visited, session duration). IP anonymization is active. Activated only with your consent.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={savePreferences}
                  className="flex-1 bg-gold text-black text-[11px] tracking-[0.25em] uppercase font-bold py-3 px-6 hover:bg-gold/90 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={rejectAll}
                  className="flex-1 border border-gray-700 text-gray-300 text-[11px] tracking-[0.25em] uppercase py-3 px-6 hover:border-gray-400 hover:text-white transition-colors"
                >
                  Reject All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
