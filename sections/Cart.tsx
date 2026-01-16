
import React from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartProps {
  onClose: () => void;
  items: any[];
}

const Cart: React.FC<CartProps> = ({ onClose, items }) => {
  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <header className="p-8 border-b border-gray-900 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ShoppingBag size={24} className="text-yellow-600" />
            <h2 className="text-2xl font-serif">Your Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-6">
          {items.length === 0 ? (
            <>
              <div className="p-8 bg-gray-900 rounded-full">
                <ShoppingBag size={48} className="text-gray-700" />
              </div>
              <p className="text-xl font-serif text-gray-500">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="px-8 py-3 border border-gray-800 hover:border-yellow-600 tracking-widest uppercase text-xs font-bold transition-all"
              >
                Continue Browsing
              </button>
            </>
          ) : (
            <div className="w-full space-y-4">
               {/* Cart items list would go here */}
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-gray-900 bg-black/40">
           <div className="flex justify-between items-center mb-6">
             <span className="text-gray-400 uppercase tracking-widest text-xs">Total</span>
             <span className="text-2xl font-serif">$0.00</span>
           </div>
           <button 
             disabled 
             className="w-full py-5 bg-gray-800 text-gray-600 cursor-not-allowed uppercase tracking-widest text-xs font-bold flex items-center justify-center group"
           >
             Proceed to Checkout
             <ArrowRight size={16} className="ml-2" />
           </button>
           <p className="mt-4 text-[10px] text-gray-600 text-center">Checkout is currently disabled as the shop is coming soon.</p>
        </footer>
      </div>
    </div>
  );
};

export default Cart;
