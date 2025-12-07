import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Stylist } from './pages/Stylist';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-stone-950 text-stone-200 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stylist" element={<Stylist />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;