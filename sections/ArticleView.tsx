import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRESS_ARTICLES } from '../constants';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = PRESS_ARTICLES.find(a => a.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-32">
        <h2 className="text-4xl font-serif text-white mb-4">Article Not Found</h2>
        <button 
          onClick={() => navigate('/press')}
          className="text-yellow-600 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold"
        >
          Return to Press
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Navigation */}
      <button 
        onClick={() => navigate('/press')}
        className="group flex items-center text-gray-500 hover:text-yellow-600 transition-colors mb-12 uppercase tracking-widest text-xs font-bold"
      >
        <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
        Back to Press
      </button>

      {/* Header */}
      <header className="mb-12 border-b border-gray-900 pb-12">
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-yellow-600 mb-6">
          <span>{article.outlet}</span>
          <span className="w-1 h-1 bg-gray-700 rounded-full" />
          <span className="flex items-center text-gray-500">
            <Calendar size={14} className="mr-2" />
            {article.date}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-8">
          {article.title}
        </h1>

        <div className="flex items-center justify-between">
            <p className="text-xl text-gray-400 italic font-light border-l-4 border-yellow-600 pl-6 max-w-2xl">
            {article.excerpt}
            </p>
            <button className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-white transition-colors">
                <Share2 size={20} />
            </button>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-white prose-a:text-yellow-600 hover:prose-a:text-yellow-500 prose-blockquote:border-l-yellow-600 prose-blockquote:text-gray-300">
        {/* Helper per gestire testo normale con "a capo" invece di HTML */}
        {(article.content || '').split('\n').map((paragraph, index) => (
            paragraph.trim() !== '' ? (
                <p key={index} className="mb-6 leading-relaxed text-gray-300 text-justify">
                    {paragraph.trim()}
                </p>
            ) : null
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 pt-12 border-t border-gray-900 flex justify-center">
        <div className="text-center space-y-4">
            <p className="text-gray-500 text-sm">Original article published in Italian by {article.outlet}</p>
            <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-yellow-600 text-xs uppercase tracking-widest border-b border-yellow-600/30 hover:border-yellow-600 pb-1 transition-all"
            >
                View Original Source
            </a>
        </div>
      </div>

    </div>
  );
};

export default ArticleView;
