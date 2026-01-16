
import React from 'react';
import { MUSIC_RELEASES } from '../constants';
import { ExternalLink } from 'lucide-react';

const Music: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <header className="mb-16 text-center">
        <h2 className="text-5xl font-serif mb-4">Music</h2>
        <div className="h-1 w-20 bg-yellow-600 mx-auto" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {MUSIC_RELEASES.map((release) => (
          <div key={release.id} className="group cursor-pointer">
            <div className="relative aspect-square mb-6 overflow-hidden">
              <img 
                src={release.coverUrl} 
                alt={release.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-6">
                <a href={release.links.spotify} className="p-3 bg-green-500 rounded-full hover:scale-110 transition-transform">
                   <span className="sr-only">Spotify</span>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.301c-.216.354-.675.466-1.03.249-2.862-1.748-6.463-2.144-10.707-1.176-.403.093-.807-.159-.9-.562-.093-.404.159-.808.562-.901 4.636-1.06 8.625-.611 11.826 1.341.355.216.466.675.249 1.03zm1.472-3.26c-.272.442-.85.584-1.293.312-3.275-2.013-8.27-2.597-12.146-1.42-.497.151-1.022-.128-1.173-.625-.151-.498.128-1.022.625-1.173 4.423-1.342 9.932-.693 13.675 1.613.443.272.585.85.312 1.293zm.126-3.411c-3.927-2.332-10.419-2.548-14.183-1.405-.603.183-1.242-.158-1.425-.76-.183-.603.158-1.242.76-1.425 4.314-1.31 11.488-1.056 16.002 1.623.541.321.718 1.024.397 1.565-.321.541-1.024.718-1.551.402z"/></svg>
                </a>
                <a href={release.links.apple} className="p-3 bg-white rounded-full hover:scale-110 transition-transform">
                   <span className="sr-only">Apple Music</span>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.254 12.308c.03-.042.062-.083.094-.122.378-.45.602-.857.602-1.334 0-1.155-.86-1.92-2.126-1.92-.472 0-.903.125-1.258.33-.424.246-.773.611-1.034 1.107-.154.29-.267.62-.312.977-.04.305-.035.58-.02.822h.02c.038.566.216 1.055.518 1.436.312.395.735.617 1.232.617 1.265 0 2.125-.765 2.284-1.913zm-3.048-1.637c.057-.468.223-.884.484-1.192.274-.325.643-.512 1.052-.512.637 0 1.052.428 1.052.983 0 .285-.138.568-.372.84-.282.327-.672.535-1.042.535-.612 0-1.137-.308-1.174-.654z"/></svg>
                </a>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-yellow-600 text-xs tracking-widest uppercase">{release.type} • {release.year}</span>
              <h3 className="text-2xl font-serif text-white">{release.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Music;
