import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 border-t border-amber-900/20 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-amber-500 font-serif text-lg tracking-widest mb-4">ANNA STYLE</h3>
            <p className="text-stone-500 text-sm italic">
              "Elegance is not standing out, but being remembered."
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-4">Issue 27</h4>
            <p className="text-stone-600 text-xs">Autumn Vibes Collection</p>
          </div>
          <div className="text-center md:text-right">
             <p className="text-stone-600 text-sm">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="border-t border-stone-900 pt-8 flex justify-center">
          <p className="text-stone-700 text-xs uppercase tracking-widest">© 2024 FashionistApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};