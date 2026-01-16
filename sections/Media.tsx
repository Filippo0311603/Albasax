
import React, { useState } from 'react';
import { MEDIA_GALLERY } from '../constants';
import { Play, Maximize2, X } from 'lucide-react';
import { MediaItem } from '../types';

const Media: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <header className="mb-16 text-center">
        <h2 className="text-5xl font-serif mb-4">Gallery & Videos</h2>
        <div className="h-1 w-20 bg-yellow-600 mx-auto" />
      </header>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {MEDIA_GALLERY.map((item) => (
          <div 
            key={item.id} 
            className="relative break-inside-avoid group cursor-pointer overflow-hidden"
            onClick={() => setSelectedItem(item)}
          >
            {item.type === 'video' ? (
              <div className="relative">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    <Play size={32} fill="white" />
                  </div>
                </div>
              </div>
            ) : (
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <div className="flex justify-between items-center w-full">
                <p className="text-white text-sm font-bold tracking-widest uppercase">{item.title}</p>
                <Maximize2 size={16} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            className="absolute top-8 right-8 text-white hover:text-yellow-600 transition-colors"
            onClick={() => setSelectedItem(null)}
          >
            <X size={48} />
          </button>
          
          <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center">
            {selectedItem.type === 'video' ? (
              <video 
                controls 
                autoPlay 
                className="max-w-full max-h-[70vh] shadow-2xl"
              >
                <source src={selectedItem.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={selectedItem.url} 
                alt={selectedItem.title} 
                className="max-w-full max-h-[70vh] object-contain shadow-2xl"
              />
            )}
            <h3 className="mt-8 text-2xl font-serif text-white">{selectedItem.title}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
