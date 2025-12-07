import React from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { FashionArticle } from '../types';

const MOCK_ARTICLES: FashionArticle[] = [
  {
    id: '1',
    headline: "Autumn Edge Collection",
    subhead: "Bold Silhouettes",
    content: "Discover how the new season brings a structured revolution to your wardrobe. Sharp shoulders meet soft textures.",
    // Image: Woman in dark velvet/structured dress, very moody and editorial
    imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop", 
    tag: "Trend Report"
  },
  {
    id: '2',
    headline: "The Gold Standard",
    subhead: "Accessory Focus",
    content: "Why amber and gold accents are dominating the runway this year. A complete guide to minimal luxury.",
    // Image: High fashion model with gold jewelry, close up
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", 
    tag: "Accessories"
  },
  {
    id: '3',
    headline: "Monochrome Magic",
    subhead: "Color Theory",
    content: "Mastering the art of single-hue dressing. From deep emeralds to stark whites, here is how to layer effectively.",
    // Image: Minimalist high fashion, clean lines
    imageUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=800&auto=format&fit=crop", 
    tag: "Style Guide"
  }
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        {/* Updated Hero Image: Cinematic High Fashion Editorial */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center filter brightness-50 contrast-110"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-amber-400 text-sm md:text-base uppercase tracking-[0.4em] mb-4 animate-fade-in-up">
            Issue 27 • Autumn Vibes
          </h2>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-stone-100 mb-8 leading-none drop-shadow-2xl">
            THE NEW <br/> <span className="italic text-amber-500 font-normal">CLASSIC</span>
          </h1>
          <p className="max-w-2xl text-stone-300 text-lg md:text-xl font-light mb-10 leading-relaxed">
            Redefining your personal style with the power of artificial intelligence. 
            Upload your wardrobe, let Anna curate your look.
          </p>
          <Link 
            to="/stylist"
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-amber-500 transition-all hover:bg-amber-500"
          >
            <span className="relative z-10 text-amber-500 font-bold uppercase tracking-widest group-hover:text-stone-900">
              Start Styling
            </span>
          </Link>
        </div>
      </div>

      {/* Editorials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12 border-b border-stone-800 pb-4">
          <h2 className="font-serif text-4xl text-stone-200">Featured Stories</h2>
          <span className="text-amber-600 italic font-serif text-lg">Curated by Anna</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
};