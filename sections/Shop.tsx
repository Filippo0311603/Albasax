
import React, { useState } from 'react';
import { Package, Bell, Check, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';

type Status = 'idle' | 'loading' | 'success' | 'error';

const Shop: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          { email: email.toLowerCase().trim(), source: 'shop_notify', active: true },
          { onConflict: 'email' }
        );
      if (error) throw error;

      setStatus('success');
      setMessage("You'll be the first to know when the shop goes live.");
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full text-center space-y-8 md:space-y-12 animate-in zoom-in duration-700">
        <div className="flex justify-center">
           <div className="p-6 md:p-8 bg-gold/10 rounded-full border border-gold/30">
             <Package size={48} className="text-gold animate-pulse md:w-16 md:h-16" />
           </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif">Official Shop</h2>
          <p className="text-xl md:text-2xl text-gold font-light tracking-widest uppercase italic">Coming Soon</p>
          <p className="text-sm md:text-base text-gray-400 max-w-sm mx-auto">
            Our exclusive collection of vinyl, apparel, and limited edition prints is currently in production. 
          </p>
        </div>

        <div className="glass p-8 space-y-4">
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-4 text-green-400">
              <Check size={28} />
              <p className="text-sm">{message}</p>
            </div>
          ) : (
            <>
              <p className="text-sm tracking-widest uppercase font-bold text-gray-300">Notify me on launch</p>
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="flex-grow bg-black/50 border border-gray-800 p-4 text-sm focus:border-gold outline-none transition-all disabled:opacity-50"
                  required
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {status === 'loading'
                    ? <Loader size={16} className="animate-spin mr-2" />
                    : <Bell size={16} className="mr-2" />
                  }
                  Subscribe
                </button>
              </form>
              {status === 'error' && (
                <p className="text-red-500 text-xs">{message}</p>
              )}
              <p className="text-[10px] text-gray-500 italic">By subscribing, you agree to receive promotional updates from Albasax.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
