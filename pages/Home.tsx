import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { FashionArticle } from '../types';

// ── Particle types ──────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  opacity: number; decay: number;
  size: number; color: string;
  rotation: number; rotSpeed: number;
  shape: 'star' | 'diamond' | 'dot';
}

const COLORS = ['#fbbf24', '#fcd34d', '#f59e0b', '#d4a017', '#e7e5e4', '#a8956a'];
const MAX_PARTICLES = 120;

function createParticle(x: number, y: number): Particle {
  return {
    x: x + (Math.random() - 0.5) * 12,
    y: y + (Math.random() - 0.5) * 12,
    vx: (Math.random() - 0.5) * 1.8,
    vy: -(Math.random() * 1.2 + 0.4),
    opacity: Math.random() * 0.5 + 0.5,
    decay: Math.random() * 0.018 + 0.008,
    size: Math.random() * 5 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.12,
    shape: (['star', 'diamond', 'dot'] as const)[Math.floor(Math.random() * 3)],
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  if (p.shape === 'dot') {
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 'diamond') {
    const s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.5, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.5, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    // 4-pointed star / sparkle
    const outer = p.size;
    const inner = p.size * 0.3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? outer : inner;
      const px = Math.cos(angle - Math.PI / 2) * r;
      const py = Math.sin(angle - Math.PI / 2) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ── Particle canvas component ────────────────────────────────────────────────

const ParticleTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    let rafId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      if (particles.length >= MAX_PARTICLES) particles.splice(0, 3);
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(e.clientX, e.clientY + window.scrollY));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.025;      // upward drift
        p.vx *= 0.98;       // gentle deceleration
        p.opacity -= p.decay;
        p.rotation += p.rotSpeed;
        if (p.opacity <= 0.01) { particles.splice(i, 1); continue; }
        drawParticle(ctx, p);
      }
      rafId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
};

// ── Mock articles ────────────────────────────────────────────────────────────

const MOCK_ARTICLES: FashionArticle[] = [
  {
    id: '1',
    headline: "Autumn Edge Collection",
    subhead: "Bold Silhouettes",
    content: "Discover how the new season brings a structured revolution to your wardrobe. Sharp shoulders meet soft textures.",
    imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop",
    tag: "Trend Report"
  },
  {
    id: '2',
    headline: "The Gold Standard",
    subhead: "Accessory Focus",
    content: "Why amber and gold accents are dominating the runway this year. A complete guide to minimal luxury.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    tag: "Accessories"
  },
  {
    id: '3',
    headline: "Monochrome Magic",
    subhead: "Color Theory",
    content: "Mastering the art of single-hue dressing. From deep emeralds to stark whites, here is how to layer effectively.",
    imageUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=800&auto=format&fit=crop",
    tag: "Style Guide"
  }
];

// ── Home page ────────────────────────────────────────────────────────────────

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950">
      <ParticleTrail />

      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
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
