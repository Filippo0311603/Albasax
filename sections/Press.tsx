
import React from 'react';
import { PRESS_ARTICLES } from '../constants';
import { Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Press: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <header className="mb-16 text-center">
        <h2 className="text-5xl font-serif mb-4">Press</h2>
        <div className="h-1 w-20 bg-yellow-600 mx-auto" />
      </header>

      <div className="space-y-16">
        {PRESS_ARTICLES.map((article) => (
          <article key={article.id} className="relative group">
            <Quote className="absolute -top-6 -left-8 text-gray-800" size={64} />
            <div className="space-y-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="text-yellow-600 font-bold tracking-[0.3em] uppercase text-sm">{article.outlet}</span>
                <span className="hidden md:block w-8 h-[1px] bg-gray-700" />
                <span className="text-gray-500 text-xs uppercase tracking-widest">{article.date}</span>
              </div>
              
              <h3 className="text-3xl md:text-5xl font-serif text-white group-hover:text-yellow-600 transition-colors duration-500 leading-tight">
                "{article.title}"
              </h3>
              
              <p className="text-lg text-gray-400 italic font-light leading-relaxed max-w-3xl">
                {article.excerpt}
              </p>
              
              <Link 
                to={`/press/${article.id}`}
                className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-white hover:text-yellow-600 transition-colors group/link"
              >
                Read Full Article 
                <ArrowRight size={16} className="ml-2 transform group-hover/link:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            <div className="mt-16 h-[1px] w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
          </article>
        ))}
      </div>
    </div>
  );
};

export default Press;
