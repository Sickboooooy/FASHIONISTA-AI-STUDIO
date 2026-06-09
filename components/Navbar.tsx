import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Cover', to: '/' },
  { label: 'The Atelier', to: '/stylist' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex flex-col items-center group">
            <span className="text-3xl font-serif font-bold text-amber-500 tracking-widest group-hover:text-amber-400 transition-colors">
              FASHIONISTA
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-stone-400">
              Anna Style AI
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-baseline space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-stone-300 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border border-stone-800" />
            {/* Hamburger */}
            <button
              className="md:hidden text-stone-400 hover:text-amber-400 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-stone-950 border-t border-stone-800 px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-stone-300 hover:text-amber-400 py-2 text-sm font-medium uppercase tracking-wider transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
