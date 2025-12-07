import React from 'react';
import { FashionArticle } from '../types';

interface ArticleCardProps {
  article: FashionArticle;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="group cursor-pointer flex flex-col h-full">
      <div className="relative overflow-hidden aspect-[3/4] mb-4">
        <img 
          src={article.imageUrl} 
          alt={article.headline} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-75 group-hover:brightness-100"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-amber-500/90 text-stone-950 text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            {article.tag}
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-grow border-l-2 border-stone-800 pl-4 transition-colors group-hover:border-amber-500">
        <h3 className="font-serif text-xl md:text-2xl text-stone-200 mb-2 leading-tight group-hover:text-amber-400 transition-colors">
          {article.headline}
        </h3>
        <p className="text-amber-700/80 text-xs font-bold uppercase tracking-widest mb-2">
          {article.subhead}
        </p>
        <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">
          {article.content}
        </p>
      </div>
    </div>
  );
};