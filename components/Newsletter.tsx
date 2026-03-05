
import React, { useState } from 'react';
import { Send, Check, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_SERVER_URL || 'https://albasax-production.up.railway.app';

type Status = 'idle' | 'loading' | 'success' | 'error';

const Newsletter: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gdprChecked, setGdprChecked] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprChecked) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), name: name.trim() || null, source: 'newsletter' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('newsletter.errorMsg'));

      setStatus('success');
      setMessage(
        data.alreadyConfirmed
          ? t('newsletter.alreadyConfirmed')
          : data.queued
          ? t('newsletter.queued')
          : t('newsletter.checkEmail')
      );
      setEmail('');
      setName('');
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
          {/* GDPR Checkbox */}
          <div className="flex items-start gap-3 pt-3">
            <input
              id="newsletter-gdpr"
              type="checkbox"
              checked={gdprChecked}
              onChange={(e) => setGdprChecked(e.target.checked)}
              required
              className="mt-0.5 w-3.5 h-3.5 accent-gold cursor-pointer flex-shrink-0"
            />
            <label htmlFor="newsletter-gdpr" className="text-[10px] text-gray-500 leading-relaxed cursor-pointer">
              I agree to receive email updates about upcoming releases and artistic projects in accordance with the{' '}
              <Link to="/legal/privacy" className="text-gray-400 hover:text-gold underline">Privacy Policy</Link>.
            </label>
          </div>
        </form>
      )}
    </div>
  );
};

export default Newsletter;
