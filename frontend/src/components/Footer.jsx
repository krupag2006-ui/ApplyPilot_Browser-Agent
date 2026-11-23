import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#FAF6F0] border-t border-[#EAE2D7] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-ivory-100 flex items-center justify-center font-editorial font-bold text-base">
                AP
              </div>
              <span className="font-editorial text-xl font-bold tracking-tight text-forest-950">
                ApplyPilot
              </span>
            </div>
            
            <p className="text-sm text-charcoal-600 max-w-md leading-relaxed">
              An intelligent application companion engineered for students and fresh graduates. 
              Upload your resume once, discover high-compatibility roles, verify requirements transparently, 
              and fill demo forms with browser automation — keeping human judgement at every critical step.
            </p>

            <div className="flex items-center gap-4 text-xs text-charcoal-500 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                Deterministic Verification
              </span>
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-forest-700" />
                Playwright Automation
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-forest-700" />
                Zero Hallucinations
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li>
                <Link to="/dashboard" className="hover:text-forest-800 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="hover:text-forest-800 transition-colors">
                  Opportunities Catalog
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-forest-800 transition-colors">
                  Browser Assistant
                </Link>
              </li>
              <li>
                <Link to="/tracker" className="hover:text-forest-800 transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-forest-800 transition-colors">
                  Profile & Criteria
                </Link>
              </li>
            </ul>
          </div>

          {/* Ideathon notes & ethics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 mb-3">
              Ethical Automation
            </h4>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              ApplyPilot adheres to responsible automation principles: forms are reviewed locally, 
              no credentials are stored, and final submissions require explicit student confirmation.
            </p>
            <div className="mt-4 pt-3 border-t border-ivory-300 text-xs text-charcoal-400">
              Ideathon MVP Edition • Built with React, Tailwind & FastAPI.
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-[#EAE2D7] flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-3">
          <p>© {new Date().getFullYear()} ApplyPilot. Built for students who are tired of repetitive forms.</p>
          <div className="flex items-center gap-1 text-charcoal-600">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500 inline" />
            <span>by Krupa & Harshitha</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
