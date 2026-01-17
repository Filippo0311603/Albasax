import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md bg-[#111] border border-gray-800 p-8 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`p-4 rounded-full border-2 ${type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
            {type === 'success' ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{message}</p>
          </div>

          <button 
            onClick={onClose}
            className={`w-full py-3 font-bold uppercase tracking-widest text-xs transition-all ${
              type === 'success' 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {type === 'success' ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
