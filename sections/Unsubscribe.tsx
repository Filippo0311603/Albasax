import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://albasax-production.up.railway.app';

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const id    = searchParams.get('id');
    const token = searchParams.get('token');

    if (!id || !token) {
      setStatus('error');
      setMessage('Link non valido. Riprova dall\'email originale.');
      return;
    }

    fetch(`${SERVER_URL}/api/newsletter/unsubscribe?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.error || 'Link non valido o già utilizzato.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Errore di rete. Riprova più tardi.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#111] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass p-12 shadow-2xl border border-gray-800 text-center space-y-8 animate-in fade-in duration-500">

        {status === 'loading' && (
          <>
            <div className="mx-auto w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
              <Loader size={40} className="text-gold animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif text-white">Elaborazione…</h1>
              <p className="text-gray-500 text-sm">Attendere qualche istante.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center border border-green-800/40">
              <CheckCircle size={44} className="text-green-400" />
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-widest uppercase text-gold font-bold">Albasax</p>
              <h1 className="text-3xl font-serif text-white">Disiscritto</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sei stato rimosso dalla newsletter.<br />Ci dispiace vederti andare.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 border border-gray-700 text-gray-400 hover:border-gold hover:text-gold font-bold uppercase tracking-widest text-xs transition-all"
            >
              Torna al sito
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center border border-red-800/40">
              <AlertCircle size={44} className="text-red-500" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-serif text-white">Link non valido</h1>
              <p className="text-gray-400 text-sm">{message}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 border border-gray-700 text-gray-400 hover:border-gold hover:text-gold font-bold uppercase tracking-widest text-xs transition-all"
            >
              Torna al sito
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default Unsubscribe;
