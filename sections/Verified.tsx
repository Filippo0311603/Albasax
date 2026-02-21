import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Music } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Verified: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase verifica il token sul suo server e poi redirecta qui
    // con i token di sessione nel fragment dell'URL.
    // onAuthStateChange li rileva automaticamente e ci avvisa.
    let timeout: ReturnType<typeof setTimeout>;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        clearTimeout(timeout);
        setStatus('success');
        // Pulisce i token dall'URL senza ricaricare la pagina
        try {
          // Rimuove i token Supabase dall'URL preservando il path /verified
          window.history.replaceState(null, '', '/verified');
        } catch (_) {}
      }
    });

    // Controlla se la sessione è già presente (caso in cui la pagina
    // viene caricata dopo che i token sono già stati processati)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        clearTimeout(timeout);
        setStatus('success');
      }
    });

    // Se dopo 5 secondi non è arrivata nessuna sessione → errore
    timeout = setTimeout(() => {
      setStatus(prev => {
        if (prev === 'verifying') {
          setErrorMsg('Il link è scaduto o non è valido. Registrati di nuovo o richiedi un nuovo link.');
          return 'error';
        }
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#111] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass p-12 shadow-2xl border border-gray-800 text-center space-y-8 animate-in fade-in duration-500">

        {/* ── Verifying ── */}
        {status === 'verifying' && (
          <>
            <div className="mx-auto w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
              <Loader size={40} className="text-gold animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif text-white">Verifica in corso…</h1>
              <p className="text-gray-500 text-sm">Attendere qualche istante.</p>
            </div>
          </>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <>
            <div className="mx-auto w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
              <CheckCircle size={44} className="text-gold" />
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-widest uppercase text-gold font-bold">Albasax</p>
              <h1 className="text-4xl font-serif text-white leading-tight">
                Email verificata!
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Il tuo account è attivo. Benvenuto nell'inner circle di Albasax.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
              >
                <Music size={14} />
                Torna al sito
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 border border-gray-700 text-gray-400 hover:border-gold hover:text-gold font-bold uppercase tracking-widest text-xs transition-all"
              >
                Vai al profilo
              </button>
            </div>
          </>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <>
            <div className="mx-auto w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center border border-red-800/40">
              <AlertCircle size={44} className="text-red-500" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-serif text-white">Verifica fallita</h1>
              <p className="text-gray-400 text-sm leading-relaxed">{errorMsg}</p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-4 border border-gray-700 text-gray-300 hover:border-gold hover:text-gold font-bold uppercase tracking-widest text-xs transition-all"
              >
                ← Torna alla registrazione
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Verified;
