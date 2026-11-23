import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Briefcase, FileText, Send, User, Menu, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ onOpenUpload }) {
  const location = useLocation();
  const { profile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Application Assistant', path: '/assistant', icon: Send },
    { name: 'Tracker', path: '/tracker', icon: FileText },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EAE2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-forest-800 text-ivory-100 flex items-center justify-center font-editorial font-bold text-lg shadow-sm group-hover:bg-forest-900 transition-colors">
              AP
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-bold tracking-tight text-forest-950 leading-none">
                ApplyPilot
              </span>
              <span className="text-[11px] font-sans font-medium text-terracotta-600 tracking-wide uppercase mt-0.5">
                Intelligent Agent
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-forest-800 text-ivory-50 shadow-sm'
                      : 'text-charcoal-700 hover:text-forest-900 hover:bg-[#F2ECE3]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-terracotta-300' : 'text-charcoal-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Profile / Upload */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-ivory-200 border border-ivory-300 hover:border-forest-300 text-charcoal-800 transition-colors text-sm"
                  title="View Profile & Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-700 text-ivory-100 text-xs font-semibold flex items-center justify-center">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium truncate max-w-[120px]">
                    {profile.name || 'Student'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                </Link>
                
                <button
                  onClick={onOpenUpload}
                  className="text-xs font-medium text-forest-800 hover:text-forest-900 px-2.5 py-1.5 rounded-md hover:bg-ivory-200 transition-colors"
                >
                  Update Resume
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-sm font-medium transition-colors shadow-sm"
              >
                <span>Upload Resume</span>
                <ArrowUpRight className="w-4 h-4 text-terracotta-300" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-charcoal-700 hover:text-forest-900 hover:bg-ivory-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE2D7] bg-[#FAF6F0] px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium ${
                  active
                    ? 'bg-forest-800 text-ivory-50'
                    : 'text-charcoal-700 hover:bg-ivory-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-ivory-300">
            {profile ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-charcoal-800 font-medium text-sm"
                >
                  <User className="w-4 h-4 text-forest-700" />
                  <span>{profile.name || 'Your Profile'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUpload();
                  }}
                  className="w-full text-center py-2 px-4 rounded-md bg-forest-800 text-ivory-50 text-sm font-medium"
                >
                  Update Resume
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUpload();
                }}
                className="w-full text-center py-2.5 px-4 rounded-md bg-forest-800 text-ivory-50 text-base font-medium"
              >
                Upload Resume
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
