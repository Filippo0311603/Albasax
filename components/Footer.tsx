
import React from 'react';
import { Instagram, Twitter, Youtube, Facebook, ArrowUp } from 'lucide-react';
import Newsletter from './Newsletter';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif tracking-widest uppercase font-bold text-white">
              Alba<span className="text-yellow-600">sax</span>
            </h2>
            <p className="text-gray-400 max-w-md leading-relaxed">
              Official website for Albasax. Reimagining the landscape of modern jazz and electronic fusion. Stay connected for exclusive content and tour updates.
            </p>
            <div className="flex space-x-6">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-500 hover:text-yellow-600 transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-900 gap-6">
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Albasax Music. All rights reserved.
          </p>
          
          <div className="flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-white text-[10px] uppercase tracking-[0.2em]">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-white text-[10px] uppercase tracking-[0.2em]">Terms of Use</a>
            <a href="#" className="text-gray-600 hover:text-white text-[10px] uppercase tracking-[0.2em]">Cookie Settings</a>
          </div>

          <button 
            onClick={scrollToTop}
            className="p-3 border border-gray-800 hover:border-yellow-600 transition-all group"
          >
            <ArrowUp size={16} className="text-gray-500 group-hover:text-yellow-600" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
