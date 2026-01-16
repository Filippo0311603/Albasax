
import React from 'react';
import { Send } from 'lucide-react';

const Newsletter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-serif mb-2 uppercase tracking-widest">Join the Newsletter</h3>
        <p className="text-gray-500 text-sm">Be the first to know about new album drops and secret pop-up shows.</p>
      </div>

      <form className="relative group">
        <input 
          type="email" 
          placeholder="ENTER YOUR EMAIL"
          className="w-full bg-transparent border-b border-gray-800 py-4 text-sm tracking-[0.2em] outline-none focus:border-yellow-600 transition-all placeholder:text-gray-700"
          required
        />
        <button 
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-500 hover:text-yellow-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Newsletter;
