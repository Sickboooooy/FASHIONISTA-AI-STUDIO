import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-center group">
              <span className="text-3xl font-serif font-bold text-amber-500 tracking-widest group-hover:text-amber-400 transition-colors">
                FASHIONISTA
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-stone-400">
                Anna Style AI
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-stone-300 hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">
                Cover
              </Link>
              <Link to="/stylist" className="text-stone-300 hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">
                The Atelier
              </Link>
              <Link to="/archive" className="text-stone-300 hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">
                Archive
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border border-stone-800"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};