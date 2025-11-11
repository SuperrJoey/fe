import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HowItWorks from './HowItWorks';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-indigo-50 bg-[#0b1020] bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(1200px_600px_at_80%_-20%,rgba(107,124,255,0.15),transparent_60%)]">
      <nav className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="font-bold tracking-wide">Cryptalk</div>
        <div className="hidden md:flex items-center gap-4 text-sm">
          <a 
            href="#how-it-works" 
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('how-it-works');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="hover:text-indigo-200 transition-colors"
          >
            How it works
          </a>
          <Link to="/pricing" className="hover:text-indigo-200 transition-colors">Pricing</Link>
          <Link to="/docs" className="hover:text-indigo-200 transition-colors">Docs</Link>
          <Link to="/faq" className="hover:text-indigo-200 transition-colors">FAQ</Link>
        </div>
        <div className="flex gap-3">
          {user ? (
            <Link to="/dashboard" className="inline-flex items-center rounded-xl border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:bg-indigo-600">
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-indigo-50 hover:border-white/30">
                Sign in
              </Link>
              <Link to="/register" className="inline-flex items-center rounded-xl border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:bg-indigo-600">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="grid items-center gap-5 px-6 pt-16 pb-6 md:grid-cols-2">
        <div className="max-w-2xl">
          <h1 className="mb-3 text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">
            Secure Collaboration for Teams that Value Privacy
          </h1>
          <p className="mb-5 text-indigo-200/80 leading-relaxed">
            End‑to‑end encrypted messaging, a secure file vault, and tamper‑proof
            blockchain audit trails — all in one place.
          </p>
          <div className="my-4 flex flex-wrap gap-3">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center rounded-xl border border-transparent bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:bg-indigo-600"
            >
              {user ? 'Go to Dashboard' : 'Create your secure workspace'}
            </Link>
            <a 
              href="#how-it-works" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:border-white/30 transition-all hover:scale-105"
            >
              How it works
            </a>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["AES‑256","RSA Key Exchange","SHA‑256 Integrity","Polygon Audit Trail"].map((b) => (
              <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-indigo-200/80">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-80 md:h-96">
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-64 w-52 -rotate-6 rounded-[90px_90px_24px_24px] border border-white/20 bg-gradient-to-b from-indigo-400/30 to-cyan-300/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" />
            <div className="absolute h-40 w-32 rotate-3 translate-y-1 rounded-2xl border border-white/20 bg-gradient-to-b from-white/20 to-white/5" />
          </div>
          <div className="absolute -inset-10 blur-2xl bg-[radial-gradient(360px_220px_at_50%_60%,rgba(34,211,238,0.18),transparent_60%)]" />
        </div>
      </header>

      {/* How It Works Section */}
      <HowItWorks />

      <section className="mx-6 mb-8 rounded-2xl border border-white/20 bg-gradient-to-b from-indigo-400/20 to-cyan-300/10 p-6 text-center">
        <h2 className="mb-2 text-[clamp(20px,3vw,28px)] font-bold">Own your data. Collaborate with confidence.</h2>
        <p className="mb-4 text-indigo-200/80">Create a workspace and invite your team in minutes.</p>
        <Link
          to={user ? "/dashboard" : "/register"}
          className="inline-flex items-center rounded-xl border border-transparent bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:bg-indigo-600"
        >
          {user ? 'Open Dashboard' : 'Start free'}
        </Link>
      </section>

      <footer className="flex items-center justify-between border-t border-white/10 px-6 py-5 text-indigo-200/80">
        <div>© {new Date().getFullYear()} Cryptalk</div>
        <div className="flex gap-4">
            <a 
              href="#how-it-works" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="hover:text-indigo-50 transition-colors"
            >
              How it works
            </a>
            <Link to="/pricing" className="hover:text-indigo-50 transition-colors">
              Pricing
            </Link>
            <Link to="/docs" className="hover:text-indigo-50 transition-colors">
              Docs
            </Link>
            <Link to="/faq" className="hover:text-indigo-50 transition-colors">
              FAQ
            </Link>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;