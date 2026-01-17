
import React from 'react';
import { Package, Bell } from 'lucide-react';

const Shop: React.FC = () => {
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full text-center space-y-8 md:space-y-12 animate-in zoom-in duration-700">
        <div className="flex justify-center">
           <div className="p-6 md:p-8 bg-yellow-600/10 rounded-full border border-yellow-600/30">
             <Package size={48} className="text-yellow-600 animate-pulse md:w-16 md:h-16" />
           </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif">Official Shop</h2>
          <p className="text-xl md:text-2xl text-yellow-600 font-light tracking-widest uppercase italic">Coming Soon</p>
          <p className="text-sm md:text-base text-gray-400 max-w-sm mx-auto">
            Our exclusive collection of vinyl, apparel, and limited edition prints is currently in production. 
          </p>
        </div>

        <div className="glass p-8 space-y-4">
          <p className="text-sm tracking-widest uppercase font-bold text-gray-300">Notify me on launch</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Your email address"
              className="flex-grow bg-black/50 border border-gray-800 p-4 text-sm focus:border-yellow-600 outline-none transition-all"
              required
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-600 hover:text-white transition-all flex items-center justify-center"
            >
              <Bell size={16} className="mr-2" />
              Subscribe
            </button>
          </form>
          <p className="text-[10px] text-gray-500 italic">By subscribing, you agree to receive promotional updates from Albasax.</p>
        </div>
      </div>
    </div>
  );
};

export default Shop;
