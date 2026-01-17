
import React from 'react';
import { TOUR_DATES } from '../constants';
import { MapPin, Ticket } from 'lucide-react';

const Tour: React.FC = () => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 max-w-7xl mx-auto">
      <header className="mb-10 md:mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-serif mb-4">Tour Dates</h2>
        <div className="h-1 w-20 bg-yellow-600 mx-auto" />
      </header>

      <div className="space-y-4">
        {TOUR_DATES.map((tour) => (
          <div 
            key={tour.id} 
            className="glass p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-yellow-600 transition-colors group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 text-center md:text-left">
              <div className="space-y-1">
                <span className="text-yellow-600 text-sm font-bold tracking-tighter uppercase">{formatDate(tour.date).split(',')[0]}</span>
                <p className="text-3xl font-serif">{formatDate(tour.date).split(',')[0].split(' ')[1]}</p>
                <p className="text-gray-400 text-xs">{formatDate(tour.date).split(',')[1]}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold tracking-wide">{tour.venue}</h3>
                <div className="flex items-center justify-center md:justify-start text-gray-400 space-x-2">
                  <MapPin size={16} className="text-yellow-600" />
                  <span className="text-sm uppercase tracking-widest">{tour.location}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <a 
                href={tour.ticketUrl}
                className={`w-full md:w-auto inline-flex items-center justify-center px-8 py-3 rounded-sm transition-all tracking-widest text-sm font-bold uppercase
                  ${tour.status === 'Available' 
                    ? 'bg-white text-black hover:bg-yellow-600 hover:text-white' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                `}
              >
                <Ticket size={18} className="mr-2" />
                {tour.status === 'Sold Out' ? 'Sold Out' : 'Get Tickets'}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tour;
