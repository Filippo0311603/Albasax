
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

type Status = 'loading' | 'success' | 'already' | 'error';

const NewsletterConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const s = searchParams.get('status');
    if (s === 'success') setStatus('success');
    else if (s === 'already') setStatus('already');
    else if (s === 'error') setStatus('error');
    else setStatus('error');
  }, [searchParams]);

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-700">

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader size={40} className="animate-spin text-gold" />
            <p className="text-gray-400 tracking-widest uppercase text-sm">Verifica in corso…</p>
          </div>
        )}

        {(status === 'success' || status === 'already') && (
          <>
            <div className="flex justify-center">
              <div className="p-6 bg-gold/10 rounded-full border border-gold/30">
                <CheckCircle size={40} className="text-gold" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-serif tracking-widest uppercase text-gold">
                {status === 'already' ? 'Già iscritto' : 'Iscrizione confermata'}
              </h1>
              <p className="text-gray-400 text-sm tracking-wider leading-relaxed">
                {status === 'already'
                  ? 'Sei già iscritto alla newsletter di Albasax.'
                  : 'Benvenuto nella cerchia ristretta. Riceverai aggiornamenti su musica, concerti e novità.'}
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <Link
              to="/"
              className="inline-block text-xs tracking-[0.3em] uppercase text-gray-500 hover:text-gold transition-colors"
            >
              ← Torna alla home
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="p-6 bg-red-900/20 rounded-full border border-red-800/30">
                <XCircle size={40} className="text-red-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-serif tracking-widest uppercase">
                Link non valido
              </h1>
              <p className="text-gray-400 text-sm tracking-wider leading-relaxed">
                Il link di conferma non è valido o è già stato usato.<br />
                Prova a iscriverti di nuovo.
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            <Link
              to="/"
              className="inline-block text-xs tracking-[0.3em] uppercase text-gray-500 hover:text-gold transition-colors"
            >
              ← Torna alla home
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default NewsletterConfirm;
