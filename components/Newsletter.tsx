
import React, { useState } from 'react';
import { Send, Check, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useTranslation } from 'react-i18next';

type Status = 'idle' | 'loading' | 'success' | 'error';

const Newsletter: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          { email: email.toLowerCase().trim(), name: name.trim() || null, source: 'newsletter', active: true },
          { onConflict: 'email' }
        );
      if (error) throw error;

      setStatus('success');
      setMessage(t('newsletter.successMsg'));
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || t('newsletter.errorMsg'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-serif mb-2 uppercase tracking-widest">{t('newsletter.title')}</h3>
        <p className="text-gray-500 text-sm">{t('newsletter.subtitle')}</p>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-3 py-4 text-green-400">
          <Check size={18} />
          <span className="text-sm">{message}</span>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-0 relative group">
          <input
            type="text"
            placeholder={t('newsletter.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'loading'}
            className="w-full bg-transparent border-b border-gray-800 py-3 text-sm tracking-[0.2em] outline-none focus:border-gold transition-all placeholder:text-gray-700 disabled:opacity-50 mb-0"
          />
          <div className="relative">
          <input
            type="email"
            placeholder={t('newsletter.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="w-full bg-transparent border-b border-gray-800 py-4 text-sm tracking-[0.2em] outline-none focus:border-gold transition-all placeholder:text-gray-700 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-500 hover:text-gold transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
          </div>
          {status === 'error' && (
            <p className="text-red-500 text-xs mt-2">{message}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default Newsletter;
