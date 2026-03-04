
import React, { useState, useEffect } from 'react';
import { PRESS_ARTICLES } from '../constants';
import { supabase } from '../supabaseClient';
import { PressArticle } from '../types';
import { ExternalLink, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Press: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<PressArticle[]>(PRESS_ARTICLES);

  useEffect(() => {
    supabase.from('press_articles').select('*').order('sort_order').order('created_at').then(({ data }) => {
      if (data && data.length > 0) {
        setArticles(data.map(r => ({
          id: r.id, title: r.title, outlet: r.outlet,
          date: r.date, excerpt: r.excerpt, imageUrl: r.image_url, url: r.url,
        })));
      }
    });
  }, []);

  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <header className="mb-12 text-center">
        <h2 className="text-5xl font-serif mb-4">{t('press.title')}</h2>
        <div className="h-1 w-20 bg-gold mx-auto" />
      </header>

      <div className="space-y-4">
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <article className="flex gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors duration-200 border border-transparent hover:border-gray-800">
              {/* Immagine a sinistra */}
              <div className="flex-shrink-0 w-32 h-24 md:w-40 md:h-28 overflow-hidden rounded-lg bg-gray-900">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Contenuto a destra */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {/* Outlet e data */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gold text-xs font-bold uppercase tracking-wider">
                      {article.outlet}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {article.date}
                    </span>
                  </div>

                  {/* Titolo */}
                  <h3 className="text-white text-base md:text-lg font-medium leading-snug group-hover:text-gold transition-colors duration-200 line-clamp-2 mb-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-400 text-sm line-clamp-2 hidden md:block">
                    {article.excerpt}
                  </p>
                </div>

                {/* Link esterno */}
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                  <ExternalLink size={12} />
                  <span className="group-hover:text-gold transition-colors">{t('press.readMore')}</span>
                </div>
              </div>
            </article>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Press;
